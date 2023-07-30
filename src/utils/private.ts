import _sodium from "libsodium-wrappers";
import YAML from "yaml";
import { Payload } from "../types";
import { Context } from "probot";
import { fromConfig as config } from "./helpers";

const CONFIGURATION_REPOSITORY = "ubiquibot-config";
const PRIVATE_KEY_PATH = ".github/ubiquibot-config.yml";
const PRIVATE_KEY_NAME = "private-key-encrypted";
const PRIVATE_KEY_PREFIX = "HSK_";

export const getConfigSuperset = async (context: Context, type: "org"): Promise<string | undefined> => {
  try {
    const payload = context.payload as Payload;
    let repository = payload.repository.name;
    let owner = payload.repository.owner.login;

    if (type === "org") {
      repository = CONFIGURATION_REPOSITORY;
      const login = payload.organization?.login;
      if (login) {
        owner = login;
      }
    }

    if (!repository || !owner) {
      return undefined;
    }

    const { data } = await context.octokit.rest.repos.getContent({
      owner,
      repo: repository,
      path: PRIVATE_KEY_PATH,
      mediaType: {
        format: "raw",
      },
    });
    return data as unknown as string;
  } catch (error: unknown) {
    return undefined;
  }
};

export interface ConfigLabel {
  name: string;
  weight: number;
  value?: number | undefined;
}

// defaults
export const defaultConfiguration = {
  "evm-network-id": 1,
  "base-multiplier": 0,
  "issue-creator-multiplier": 0,
  "time-labels": [],
  "priority-labels": [],
  "auto-pay-mode": false,
  "promotion-comment": `<h6>If you enjoy the DevPool experience, please follow <a href="https://github.com/ubiquity">Ubiquity on GitHub</a> and star <a href="https://github.com/ubiquity/devpool-directory">this repo</a> to show your support. It helps a lot!</h6>`,
  "analytics-mode": true,
  "incentive-mode": false,
  "max-concurrent-bounties": 0,
  "comment-element-pricing": {},
  "default-labels": [],
} as DefaultConfiguration;

interface DefaultConfiguration {
  "evm-network-id": number;
  "base-multiplier": number;
  "issue-creator-multiplier": number;
  "time-labels": ConfigLabel[];
  "priority-labels": ConfigLabel[];
  "auto-pay-mode": boolean;
  "promotion-comment": string;
  "analytics-mode": boolean;
  "incentive-mode": boolean;
  "max-concurrent-bounties": number;
  "comment-element-pricing": Record<string, number>;
  "default-labels": string[];
}

export type RepositoryConfiguration = DefaultConfiguration;
export interface OrganizationConfiguration extends DefaultConfiguration {
  "private-key-encrypted"?: string;
}

export const parseYAML = (data?: string): RepositoryConfiguration => {
  try {
    if (data) {
      const parsedData = YAML.parse(data);
      return parsedData;
    }
  } catch (error) {
    console.error(error);
  }
  return defaultConfiguration;
};

export const getPrivateKey = async (cipherText: string): Promise<string | undefined> => {
  try {
    await _sodium.ready;
    const sodium = _sodium;

    const privateKey = process.env.X25519_PRIVATE_KEY;
    const publicKey = await getScalarKey(privateKey);

    if (!publicKey || !privateKey) {
      return undefined;
    }

    const binPub = sodium.from_base64(publicKey, sodium.base64_variants.URLSAFE_NO_PADDING);
    const binPriv = sodium.from_base64(privateKey, sodium.base64_variants.URLSAFE_NO_PADDING);
    const binCipher = sodium.from_base64(cipherText, sodium.base64_variants.URLSAFE_NO_PADDING);

    let walletPrivateKey: string | undefined = sodium.crypto_box_seal_open(binCipher, binPub, binPriv, "text");
    walletPrivateKey = walletPrivateKey.replace(PRIVATE_KEY_PREFIX, "");
    return walletPrivateKey;
  } catch (error: unknown) {
    return undefined;
  }
};

export const getScalarKey = async (X25519_PRIVATE_KEY: string | undefined): Promise<string | undefined> => {
  try {
    if (X25519_PRIVATE_KEY !== undefined) {
      await _sodium.ready;
      const sodium = _sodium;

      const binPriv = sodium.from_base64(X25519_PRIVATE_KEY, sodium.base64_variants.URLSAFE_NO_PADDING);
      const scalerPub = sodium.crypto_scalarmult_base(binPriv, "base64");
      return scalerPub;
    }
    return undefined;
  } catch (error: unknown) {
    return undefined;
  }
};

export const getConfig = async (context: Context) => {
  const orgConfig = await getConfigSuperset(context, "org");
  const repoConfig = await getConfigSuperset(context, "repo");

  const organization: OrganizationConfiguration = parseYAML(orgConfig);
  const repository: RepositoryConfiguration = parseYAML(repoConfig);
  const configs = { repository, organization };

  const configData = {
    privateKey: organization && organization[PRIVATE_KEY_NAME] ? await getPrivateKey(organization[PRIVATE_KEY_NAME]) : "",

    evmNetworkId: config.getNumber("evm-network-id", configs),
    baseMultiplier: config.getNumber("base-multiplier", configs),
    issueCreatorMultiplier: config.getNumber("issue-creator-multiplier", configs),
    timeLabels: config.getLabels("time-labels", configs),
    priorityLabels: config.getLabels("priority-labels", configs),
    autoPayMode: config.getBoolean("auto-pay-mode", configs),
    analyticsMode: config.getBoolean("analytics-mode", configs),
    maxConcurrentBounties: config.getNumber("max-concurrent-bounties", configs),
    incentiveMode: config.getBoolean("incentive-mode", configs),
    commentElementPricing: config.getCommentItemPrice("comment-element-pricing", configs),
    defaultLabels: config.getStrings("default-labels", configs),
    promotionComment: config.getString("promotion-comment", configs),
  };

  return configData;
};

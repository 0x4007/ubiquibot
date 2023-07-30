import { CommentElementPricing } from "../types";
import { ConfigLabel, ConfigOrganization, ConfigRepository, Config } from "./private";

// These are the key names of the properties inside of the configuration.
// They are used to get the values from the configuration.
// The name of each type expresses the type of the value that is expected to be returned.

type getsNumber = "evm-network-id" | "base-multiplier" | "issue-creator-multiplier" | "max-concurrent-bounties";
type getsString = "promotion-comment";
type getsBoolean = "auto-pay-mode" | "analytics-mode" | "incentive-mode";
type getsArrayOfStrings = "default-labels";
type getsCommentElementPricing = "comment-element-pricing";
type getsLabels = "time-labels" | "priority-labels";

interface Configs {
  repository?: ConfigRepository;
  organization?: ConfigOrganization;
  // default: ConfigRepository;
}

export const fromConfig = {
  getNumber: function getNumberFromConfig(key: getsNumber, { repository: repository, organization: organization }: Configs): number {
    if (repository && repository[key] && !Number.isNaN(Number(repository[key]))) {
      return Number(repository[key]);
    } else if (organization && organization[key] && !Number.isNaN(Number(organization[key]))) {
      return Number(organization[key]);
    } else {
      return Number(Config[key]);
    }
  },
  getLabels: function getLabelsFromConfig(key: getsLabels, { repository: repository, organization: organization }: Configs): ConfigLabel[] {
    if (repository && repository[key] && Array.isArray(repository[key]) && repository[key].length > 0) {
      return repository[key];
    } else if (organization && organization[key] && Array.isArray(organization[key]) && organization[key].length > 0) {
      return organization[key];
    } else {
      return Config[key];
    }
  },
  getCommentItemPrice: function getCommentItemPriceFromConfig(
    key: getsCommentElementPricing,
    { repository: repository, organization: organization }: Configs
  ): CommentElementPricing {
    if (repository && repository[key]) {
      return repository[key];
    } else if (organization && organization[key]) {
      return organization[key];
    } else {
      return Config[key];
    }
  },
  getBoolean: function getBooleanFromConfig(key: getsBoolean, { repository: repository, organization: organization }: Configs): boolean {
    if (repository && repository[key] && typeof repository[key] === "boolean") {
      return repository[key];
    } else if (organization && organization[key] && typeof organization[key] === "boolean") {
      return organization[key];
    } else {
      return Config[key];
    }
  },
  getString: function getStringFromConfig(key: getsString, { repository: repository, organization: organization }: Configs): string {
    if (repository && repository[key] && typeof repository[key] === "string") {
      return repository[key];
    } else if (organization && organization[key] && typeof organization[key] === "string") {
      return organization[key];
    } else {
      return Config[key];
    }
  },
  getStrings: function getStringsFromConfig(key: getsArrayOfStrings, { repository: repository, organization: organization }: Configs): string[] {
    if (repository && repository[key]) {
      return repository[key];
    } else if (organization && organization[key]) {
      return organization[key];
    } else {
      return Config[key];
    }
  },
};

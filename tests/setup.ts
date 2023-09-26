import { EmitterWebhookEventName } from "@octokit/webhooks";
import { Probot, run } from "probot";
import { bindEvents } from "../src/bindings";
import { GithubEvent, Issue } from "../src/types";
import {
  CustomOctokit,
  orgConfig,
  ORGANIZATION,
  REPOSITORY,
  setAdminUsername,
  setCollaboratorUsername,
  setAdminUser,
  setCollaborator,
  setServer,
} from "./main.test";
import { repoConfig } from "./test-repository-config";
import { updateConfig, waitForNWebhooks, webhookEventEmitter } from "./utils";
import { getAdminUser, getAdminUsername, getCollaborator, getCollaboratorUsername } from "./main.test";

export async function setupTests(): Promise<Issue> {
  console.log("setupTests");
  await setupAdminUser();
  const issue = await createIssue();
  await setupOutsideCollaborator();
  await setupTestServer();
  await setupTestConfigs();
  return issue;
}

async function setupTestConfigs() {
  await updateConfig(getAdminUser(), ORGANIZATION, "ubiquibot-config", ".github/ubiquibot-config.yml", orgConfig);
  await waitForNWebhooks(1);
  await updateConfig(getAdminUser(), ORGANIZATION, REPOSITORY, ".github/ubiquibot-config.yml", repoConfig);
  await waitForNWebhooks(1);
}

async function setupTestServer() {
  setServer(
    await run(function main(app: Probot) {
      const allowedEvents = Object.values(GithubEvent) as EmitterWebhookEventName[];
      app.on(allowedEvents, async (context) => {
        await bindEvents(context);
        webhookEventEmitter.emit("event", context.payload);
      });
    })
  );
}

async function setupOutsideCollaborator() {
  const outsideCollaboratorPAT = process.env.TEST_OUTSIDE_COLLABORATOR_PAT;
  if (!outsideCollaboratorPAT) {
    throw new Error("missing TEST_OUTSIDE_COLLABORATOR_PAT");
  }

  setCollaborator(new CustomOctokit({ auth: outsideCollaboratorPAT }));

  const { data: data2 } = await getCollaborator().rest.users.getAuthenticated();
  setCollaboratorUsername(data2.login);

  // check if the user is outside collaborator
  const { data: data3 } = await getAdminUser().rest.repos.getCollaboratorPermissionLevel({
    repo: REPOSITORY,
    owner: ORGANIZATION,
    username: getCollaboratorUsername(),
  });
  if (data3.permission === "admin" || data3.permission === "write") {
    throw new Error("TEST_OUTSIDE_COLLABORATOR_PAT is not outside collaborator");
  }
  if (data3.permission !== "read") {
    throw new Error("TEST_OUTSIDE_COLLABORATOR_PAT does not have read access");
  }
}

async function setupAdminUser() {
  const adminPAT = process.env.TEST_ADMIN_PAT;
  if (!adminPAT) {
    throw new Error("missing TEST_ADMIN_PAT");
  }

  setAdminUser(new CustomOctokit({ auth: adminPAT }));

  const { data } = await getAdminUser().rest.users.getAuthenticated();
  setAdminUsername(data.login);

  // check if the user is admin
  const { data: data1 } = await getAdminUser().rest.repos.getCollaboratorPermissionLevel({
    repo: REPOSITORY,
    owner: ORGANIZATION,
    username: getAdminUsername(),
  });
  if (data1.permission !== "admin") {
    throw new Error("TEST_ADMIN_PAT is not admin");
  }
}

async function createIssue(): Promise<Issue> {
  const res = await getAdminUser().rest.issues.create({
    repo: REPOSITORY,
    owner: ORGANIZATION,
    title: `${new Date().toISOString()} - E2E TEST`,
  });

  const issue = res.data as Issue;
  await waitForNWebhooks(4);

  console.log(issue);

  return issue;
}

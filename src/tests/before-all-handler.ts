import { Probot, run } from "probot";

import { bindEvents } from "../bindings/event";
import { GitHubEvent } from "../types/payload";
import ubiquibotConfigDefault from "../ubiquibot-config-default";
import {
  CustomOctokit,
  getAdminUser,
  getAdminUsername,
  getCollaboratorUser,
  getCollaboratorUsername,
  organizationConfiguration,
  owner,
  repo,
  setAdminUser,
  setAdminUsername,
  setCollaboratorUser,
  setCollaboratorUsername,
  setServer,
} from "./commands-test";
import { updateConfig, waitForNWebhooks, webhookEventEmitter } from "./utils";

export function beforeAllHandler(): jest.ProvidesHookCallback {
  return async () => {
    const adminPAT = process.env.TEST_ADMIN_PAT;
    if (!adminPAT) {
      throw new Error("missing TEST_ADMIN_PAT");
    }

    setAdminUser(new CustomOctokit({ auth: adminPAT }));

    const { data } = await getAdminUser().rest.users.getAuthenticated();
    setAdminUsername(data.login);

    // check if the user is admin
    const adminUsername = getAdminUsername();
    if (!adminUsername) {
      throw new Error("TEST_ADMIN_PAT is not admin");
    }

    const { data: data1 } = await getAdminUser().rest.repos.getCollaboratorPermissionLevel({
      repo,
      owner,
      username: adminUsername,
    });
    if (data1.permission !== "admin") {
      throw new Error("TEST_ADMIN_PAT is not admin");
    }

    const outsideCollaboratorPAT = process.env.TEST_OUTSIDE_COLLABORATOR_PAT;
    if (!outsideCollaboratorPAT) {
      throw new Error("missing TEST_OUTSIDE_COLLABORATOR_PAT");
    }

    setCollaboratorUser(new CustomOctokit({ auth: outsideCollaboratorPAT }));

    const { data: data2 } = await getCollaboratorUser().rest.users.getAuthenticated();
    setCollaboratorUsername(data2.login);

    // check if the user is outside collaborator
    const collaboratorUsername = getCollaboratorUsername();
    if (!collaboratorUsername) {
      throw new Error("TEST_OUTSIDE_COLLABORATOR_PAT is not outside collaborator");
    }
    const { data: data3 } = await getAdminUser().rest.repos.getCollaboratorPermissionLevel({
      repo,
      owner,
      username: collaboratorUsername,
    });
    if (data3.permission === "admin" || data3.permission === "write") {
      throw new Error("TEST_OUTSIDE_COLLABORATOR_PAT is not outside collaborator");
    }
    if (data3.permission !== "read") {
      throw new Error("TEST_OUTSIDE_COLLABORATOR_PAT does not have read access");
    }

    const server = await run(function main(app: Probot) {
      const allowedEvents = Object.values(GitHubEvent);
      app.on(allowedEvents, async (context) => {
        await bindEvents(context);
        webhookEventEmitter.emit("event", context.payload);
      });
    });

    setServer(server);

    await updateConfig({
      octokit: getAdminUser(),
      owner,
      repo: "ubiquibot-config",
      path: ".github/ubiquibot-config.yml",
      config: organizationConfiguration,
    });
    await waitForNWebhooks(1);
    await updateConfig({
      octokit: getAdminUser(),
      owner,
      repo,
      path: ".github/ubiquibot-config.yml",
      config: ubiquibotConfigDefault,
    });
    await waitForNWebhooks(1);
  };
}

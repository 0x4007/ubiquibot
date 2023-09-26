import { describe, test } from "@jest/globals";
import "dotenv/config";
import { Octokit } from "octokit";
import { Server } from "probot";
import { Issue, RepositoryConfig } from "../src/types";
// import { allowTest } from "./allowTest";
import { breakDownTests } from "./breakdown";
// import { helpTest } from "./helpTest";
// import { multiplierTest } from "./multiplierTest";
// import { queryTest } from "./queryTest";
// import { queryWrongUsernameTest } from "./queryWrongUsernameTest";
import { setupTests } from "./setup";
// import { startStopTest } from "./startStopTest";
import { walletCorrectAddressTest } from "./walletCorrectAddressTest";
// import { walletWrongAddressTest } from "./walletWrongAddressTest";

export const TEST_TIME_LABEL = "Time: <1 Hour";
export const TEST_PRIORITY_LABEL = "Priority: 1 (Normal)";
export const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 hours
export const DATE_NOW = new Date().toISOString();
export const ORGANIZATION = process.env.TEST_ORGANIZATION_NAME || "ubiquibot";
export const REPOSITORY = process.env.TEST_REPOSITORY_NAME || "e2e-tests";

let _adminUser: Octokit;
let _adminUsername = "";
let _collaboratorUser: Octokit;
let _collaboratorUsername = "";
let _server: Server;

beforeAll(async () => {
  console.log("beforeAll");
  _issue = await setupTests();
}, SIX_HOURS);

describe("e2e github tests", () => {
  // Now, the testSuite function is invoked only when Jest is executing the tests.
  test("/wallet correct address", walletCorrectAddressTest(), SIX_HOURS);
  // test("/wallet wrong address", walletWrongAddressTest(), SIX_HOURS);
  // test("/multiplier", multiplierTest(), SIX_HOURS);
  // test("/query", queryTest(), SIX_HOURS);
  // test("/query wrong username", queryWrongUsernameTest(), SIX_HOURS);
  // test("/help", helpTest(), SIX_HOURS);
  // test("/allow", allowTest(), SIX_HOURS);
  // test("/start and /stop", startStopTest(), SIX_HOURS);
});

afterAll(async () => {
  breakDownTests();
});

export function getAdminUser(): Octokit {
  return _adminUser;
}
export function setAdminUser(value: Octokit) {
  _adminUser = value;
}
export function getCollaborator(): Octokit {
  return _collaboratorUser;
}
export function setCollaborator(value: Octokit) {
  _collaboratorUser = value;
}
export function getAdminUsername(): string {
  return _adminUsername;
}
export function setAdminUsername(value: string) {
  _adminUsername = value;
}
export function getCollaboratorUsername(): string {
  return _collaboratorUsername;
}
export function setCollaboratorUsername(value: string) {
  _collaboratorUsername = value;
}
export function getServer(): Server {
  return _server;
}
export function setServer(value: Server) {
  _server = value;
}

export const orgConfig: RepositoryConfig = {
  privateKeyEncrypted:
    "YU-tFJFczN3JPVoJu0pQKSbWoeiCFPjKiTXMoFnJxDDxUNX-BBXc6ZHkcQcHVjdOd6ZcEnU1o2jU3F-i05mGJPmhF2rhQYXkNlxu5U5fZMMcgxJ9INhAmktzRBUxWncg4L1HOalZIoQ7gm3nk1a84g",
};

export const CustomOctokit = Octokit.defaults({
  throttle: {
    onRateLimit: () => {
      return true;
    },
    onSecondaryRateLimit: () => {
      return true;
    },
  },
});
let _issue: Issue;

export function issueGetter(): Issue {
  if (!_issue) throw new Error("_issue not initialized");
  return _issue;
}

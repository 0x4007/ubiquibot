import { expect } from "@jest/globals";
import { createComment, getLastComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY } from "./main.test";

export function helpTest() {
  return async () => {
    const issue = issueGetter();
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/help`);
    await waitForNWebhooks(2);

    const lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body?.includes("Available Commands")).toBe(true);
  };
}

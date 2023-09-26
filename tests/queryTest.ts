import { expect } from "@jest/globals";
import { createComment, getLastComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY, getAdminUsername } from "./main.test";

export function queryTest() {
  return async () => {
    const issue = issueGetter();
    const newWallet = "0x82AcFE58e0a6bE7100874831aBC56Ee13e2149e7";
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/wallet ${newWallet}`);
    await waitForNWebhooks(2);

    const multiplier = "5";
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier @${getAdminUsername()} ${multiplier} 'Testing'`);
    await waitForNWebhooks(2);

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/query @${getAdminUsername()}`);
    await waitForNWebhooks(2);

    const lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain(`@${getAdminUsername()}'s wallet address is ${newWallet}, multiplier is ${multiplier}`);
  };
}

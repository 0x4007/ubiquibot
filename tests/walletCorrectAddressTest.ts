import { checkLastComment, createComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY, getAdminUsername } from "./main.test";

export function walletCorrectAddressTest() {
  return async () => {
    const issue = issueGetter();
    const newWallet = "0x82AcFE58e0a6bE7100874831aBC56Ee13e2149e7";
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/wallet ${newWallet}`);
    await waitForNWebhooks(2);
    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Updated the wallet address for @${getAdminUsername()} successfully!\t Your new address: \`${newWallet}\``
    );
  };
}

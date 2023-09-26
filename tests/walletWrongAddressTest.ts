import { checkLastComment, createComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY } from "./main.test";

export function walletWrongAddressTest() {
  return async () => {
    const issue = issueGetter();
    const newWallet = "0x82AcFE58e0a6bE7100874831aBC56";
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/wallet ${newWallet}`);
    await waitForNWebhooks(2);
    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Please include your wallet or ENS address.\n usage: /wallet 0x0000000000000000000000000000000000000000`
    );
  };
}

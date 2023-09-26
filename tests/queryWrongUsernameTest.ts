import { checkLastComment, createComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY } from "./main.test";

export function queryWrongUsernameTest() {
  return async () => {
    const issue = issueGetter();
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/query @INVALID_$USERNAME`);
    await waitForNWebhooks(2);

    await checkLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `Invalid syntax for query command \n usage /query @user`);
  };
}

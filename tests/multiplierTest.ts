import { checkLastComment, createComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY, getAdminUsername } from "./main.test";

export function multiplierTest() {
  return async () => {
    const issue = issueGetter();
    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier @${getAdminUsername()}`);
    await waitForNWebhooks(2);

    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Successfully changed the payout multiplier for @${getAdminUsername()} to 1. The reason is not provided.`
    );

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier @${getAdminUsername()} 2`);
    await waitForNWebhooks(2);

    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Successfully changed the payout multiplier for @${getAdminUsername()} to 2. The reason is not provided. This feature is designed to limit the contributor's compensation for any task on the current repository due to other compensation structures (i.e. salary.) are you sure you want to use a price multiplier above 1?`
    );

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier @${getAdminUsername()} 2 "Testing reason"`);
    await waitForNWebhooks(2);

    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Successfully changed the payout multiplier for @${getAdminUsername()} to 2. The reason provided is "Testing reason". This feature is designed to limit the contributor's compensation for any task on the current repository due to other compensation structures (i.e. salary.) are you sure you want to use a price multiplier above 1?`
    );

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier @${getAdminUsername()} abcd`);
    await waitForNWebhooks(2);

    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Successfully changed the payout multiplier for @${getAdminUsername()} to 1. The reason provided is "abcd".`
    );

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/multiplier abcd`);
    await waitForNWebhooks(2);

    await checkLastComment(
      getAdminUser(),
      ORGANIZATION,
      REPOSITORY,
      issue.number,
      `Successfully changed the payout multiplier for @${getAdminUsername()} to 1. The reason provided is "abcd".`
    );
  };
}

import { expect } from "@jest/globals";
import { createComment, getLastComment, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY, TEST_TIME_LABEL, TEST_PRIORITY_LABEL, getAdminUsername } from "./main.test";

export function startStopTest() {
  return async () => {
    const issue = issueGetter();
    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      labels: [],
    });

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "closed",
    });
    await waitForNWebhooks(2);

    let lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Permit generation disabled because this issue didn't qualify for funding");

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "open",
    });
    await waitForNWebhooks(1);

    try {
      await getAdminUser().rest.issues.createLabel({
        owner: ORGANIZATION,
        repo: REPOSITORY,
        name: TEST_TIME_LABEL,
      });
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      await getAdminUser().rest.issues.addLabels({
        owner: ORGANIZATION,
        repo: REPOSITORY,
        issue_number: issue.number,
        labels: [TEST_TIME_LABEL],
      });
      await waitForNWebhooks(1);
    }

    try {
      await getAdminUser().rest.issues.createLabel({
        owner: ORGANIZATION,
        repo: REPOSITORY,
        name: TEST_PRIORITY_LABEL,
      });
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      await getAdminUser().rest.issues.addLabels({
        owner: ORGANIZATION,
        repo: REPOSITORY,
        issue_number: issue.number,
        labels: [TEST_PRIORITY_LABEL],
      });
      await waitForNWebhooks(2);
    }

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "closed",
    });
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Permit generation disabled because assignee is undefined");

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "open",
    });
    await waitForNWebhooks(1);

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/autopay false`);
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Automatic payment for this issue is enabled: **false**");

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/start`);
    await waitForNWebhooks(3);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    const lastCommentBody = lastComment.body?.toLowerCase();
    expect(lastCommentBody).toContain("deadline");
    expect(lastCommentBody).toContain("registered wallet");
    expect(lastCommentBody).toContain("payment multiplier");
    expect(lastCommentBody).toContain("multiplier reason");

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/stop`);
    await waitForNWebhooks(3);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toBe(`You have been unassigned from the task @${getAdminUsername()}`);

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/start`);
    await waitForNWebhooks(3);

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "closed",
    });
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Permit generation disabled because automatic payment for this issue is disabled.");

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "open",
    });
    await waitForNWebhooks(1);

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/autopay true`);
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toBe("Automatic payment for this issue is enabled: **true**");

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "closed",
      state_reason: "not_planned",
    });
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Permit generation disabled because this is marked as unplanned");

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "open",
    });
    await waitForNWebhooks(1);

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      state: "closed",
    });
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain("Task Assignee Reward");
  };
}

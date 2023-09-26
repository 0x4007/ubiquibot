import { expect } from "@jest/globals";
import { addLabelToIssue, createComment, createLabel, getLastComment, removeLabelFromIssue, waitForNWebhooks } from "./utils";
import { issueGetter, getAdminUser, ORGANIZATION, REPOSITORY, TEST_PRIORITY_LABEL, getCollaboratorUsername, getCollaborator } from "./main.test";

export function allowTest() {
  return async () => {
    const issue = issueGetter();
    await createLabel(getAdminUser(), ORGANIZATION, REPOSITORY, TEST_PRIORITY_LABEL);

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      labels: [],
    });

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/allow set-priority @${getCollaboratorUsername()} false`);
    await waitForNWebhooks(2);

    let lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain(
      `Updated access for @${getCollaboratorUsername()} successfully!\t Access: **priority** for "${ORGANIZATION}/${REPOSITORY}"`
    );

    // collaborator adds label
    await addLabelToIssue(getCollaborator(), ORGANIZATION, REPOSITORY, issue.number, TEST_PRIORITY_LABEL);
    await waitForNWebhooks(3);

    let issueDetails = await getAdminUser().rest.issues.get({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
    });
    expect(issueDetails.data.labels?.length).toBe(0);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain(`@${getCollaboratorUsername()}, You are not allowed to add Priority: 1 (Normal)`);

    await getAdminUser().rest.issues.update({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
      labels: [TEST_PRIORITY_LABEL],
    });

    await removeLabelFromIssue(getCollaborator(), ORGANIZATION, REPOSITORY, issue.number, TEST_PRIORITY_LABEL);
    await waitForNWebhooks(3);

    issueDetails = await getAdminUser().rest.issues.get({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
    });
    expect(issueDetails.data.labels?.length).toBe(1);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain(`@${getCollaboratorUsername()}, You are not allowed to remove Priority: 1 (Normal)`);

    await createComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number, `/allow set-priority @${getCollaboratorUsername()} true`);
    await waitForNWebhooks(2);

    lastComment = await getLastComment(getAdminUser(), ORGANIZATION, REPOSITORY, issue.number);
    expect(lastComment.body).toContain(
      `Updated access for @${getCollaboratorUsername()} successfully!\t Access: **priority** for "${ORGANIZATION}/${REPOSITORY}"`
    );

    await removeLabelFromIssue(getCollaborator(), ORGANIZATION, REPOSITORY, issue.number, TEST_PRIORITY_LABEL);
    await waitForNWebhooks(1);

    issueDetails = await getAdminUser().rest.issues.get({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
    });
    expect(issueDetails.data.labels?.length).toBe(0);

    await addLabelToIssue(getCollaborator(), ORGANIZATION, REPOSITORY, issue.number, TEST_PRIORITY_LABEL);
    await waitForNWebhooks(1);

    issueDetails = await getAdminUser().rest.issues.get({
      owner: ORGANIZATION,
      repo: REPOSITORY,
      issue_number: issue.number,
    });
    expect(issueDetails.data.labels?.length).toBe(1);
  };
}

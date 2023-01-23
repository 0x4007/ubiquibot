// https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads

import { Static, Type } from "@sinclair/typebox";
import { LabelSchema } from "./label";

export enum Action {
  REQUESTED = "requested",
  REVIEW_REQUESTED = "review_requested",
  REVIEW_REQUEST_REMOVED = "review_request_removed",
  COMPLETED = "completed",
  REREQUESTED = "rerequested",

  ASSIGNED = "assigned",
  CLOSED = "closed",
  CREATED = "created",
  DELETED = "deleted",
  MILESTONED = "milestoned",
  DEMILESTONED = "demilestoned",
  EDITED = "edited",
  LABELED = "labeled",
  LOCKED = "locked",
  OPENED = "opened",
  PINNED = "pinned",
  REOPENED = "reopened",
  TRANSFERRED = "transferred",
  UNASSIGNED = "unassigned",
  UNLABELED = "unlabeled",
  UNLOCKED = "unlocked",
  UNPINNED = "unpinned",

  SCHEDULE = "schedule",
}

export enum UserType {
  User = "User",
  Bot = "Bot",
  Organization = "Organization",
}

export enum IssueType {
  OPEN = "open",
  CLOSED = "closed",
  ALL = "all",
}

const UserSchema = Type.Object({
  login: Type.String(),
  id: Type.Number(),
  node_id: Type.String(),
  avatar_url: Type.String(),
  gravatar_id: Type.String(),
  url: Type.String(),
  html_url: Type.String(),
  followers_url: Type.String(),
  following_url: Type.String(),
  gists_url: Type.String(),
  starred_url: Type.String(),
  subscriptions_url: Type.String(),
  organizations_url: Type.String(),
  repos_url: Type.String(),
  events_url: Type.String(),
  received_events_url: Type.String(),
  type: Type.Enum(UserType),
  site_admin: Type.Boolean(),
});

const UserProfileSchema = Type.Intersect([
  UserSchema,
  Type.Object({
    name: Type.String(),
    company: Type.String(),
    blog: Type.String(),
    location: Type.String(),
    email: Type.String(),
    hireable: Type.Boolean(),
    bio: Type.String(),
    twitter_username: Type.String(),
    public_repos: Type.Number(),
    public_gists: Type.Number(),
    followers: Type.Number(),
    following: Type.Number(),
    created_at: Type.String(),
    updated_at: Type.String(),
  }),
]);

export type User = Static<typeof UserSchema>;
export type UserProfile = Static<typeof UserProfileSchema>;

const IssueSchema = Type.Object({
  url: Type.String(),
  repository_url: Type.String(),
  labels_url: Type.String(),
  comments_url: Type.String(),
  events_url: Type.String(),
  html_url: Type.String(),
  id: Type.Number(),
  node_id: Type.String(),
  number: Type.Number(),
  title: Type.String(),
  user: UserSchema,
  labels: Type.Array(LabelSchema),
  state: Type.Enum(IssueType),
  locked: Type.Boolean(),
  assignee: Type.Any(),
  assignees: Type.Array(Type.Any()),
  comments: Type.Number(),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
  closed_at: Type.Any(),
  author_association: Type.String(),
});
export type Issue = Static<typeof IssueSchema>;

const RepositorySchema = Type.Object({
  id: Type.Number(),
  node_id: Type.String(),
  name: Type.String(),
  full_name: Type.String(),
  private: Type.Boolean(),
  owner: UserSchema,
  html_url: Type.String(),
  description: Type.String(),
  fork: Type.Boolean(),
  url: Type.String(),
  forks_url: Type.String(),
  keys_url: Type.String(),
  collaborators_url: Type.String(),
  teams_url: Type.String(),
  hooks_url: Type.String(),
  issue_events_url: Type.String(),
  events_url: Type.String(),
  assignees_url: Type.String(),
  branches_url: Type.String(),
  tags_url: Type.String(),
  blobs_url: Type.String(),
  git_tags_url: Type.String(),
  git_refs_url: Type.String(),
  trees_url: Type.String(),
  statuses_url: Type.String(),
  languages_url: Type.String(),
  stargazers_url: Type.String(),
  contributors_url: Type.String(),
  subscribers_url: Type.String(),
  subscription_url: Type.String(),
  commits_url: Type.String(),
  git_commits_url: Type.String(),
  comments_url: Type.String(),
  issue_comment_url: Type.String(),
  contents_url: Type.String(),
  compare_url: Type.String(),
  merges_url: Type.String(),
  archive_url: Type.String(),
  downloads_url: Type.String(),
  issues_url: Type.String(),
  pulls_url: Type.String(),
  milestones_url: Type.String(),
  notifications_url: Type.String(),
  labels_url: Type.String(),
  releases_url: Type.String(),
  deployments_url: Type.String(),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
  pushed_at: Type.String({ format: "date-time" }),
  git_url: Type.String(),
  ssh_url: Type.String(),
  clone_url: Type.String(),
  svn_url: Type.String(),
  size: Type.Number(),
  stargazers_count: Type.Number(),
  watchers_count: Type.Number(),
  language: Type.String(),
  has_issues: Type.Boolean(),
  has_projects: Type.Boolean(),
  has_downloads: Type.Boolean(),
  has_wiki: Type.Boolean(),
  has_pages: Type.Boolean(),
  forks_count: Type.Number(),
  archived: Type.Boolean(),
  disabled: Type.Boolean(),
  open_issues_count: Type.Number(),
  license: Type.Object({
    key: Type.String(),
    name: Type.String(),
    spdx_id: Type.String(),
    url: Type.String(),
    node_id: Type.String(),
  }),
  allow_forking: Type.Boolean(),
  is_template: Type.Boolean(),
  web_commit_signoff_required: Type.Boolean(),
  topics: Type.Array(Type.Any()),
  visibility: Type.String(),
  forks: Type.Number(),
  open_issues: Type.Number(),
  watchers: Type.Number(),
  default_branch: Type.String(),
});

const OrganizationSchema = Type.Object({
  login: Type.String(),
  id: Type.Number(),
  node_id: Type.String(),
  url: Type.String(),
  repos_url: Type.String(),
  events_url: Type.String(),
  hooks_url: Type.String(),
  issues_url: Type.String(),
  members_url: Type.String(),
  public_members_url: Type.String(),
  avatar_url: Type.String(),
  description: Type.String(),
});

const InstallationSchema = Type.Object({
  id: Type.Number(),
  node_id: Type.String(),
});

export const PayloadSchema = Type.Object({
  action: Type.String(),
  issue: Type.Optional(IssueSchema),
  label: Type.Optional(LabelSchema),
  sender: UserSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  installation: Type.Optional(InstallationSchema),
});

export type Payload = Static<typeof PayloadSchema>;

import { context, getOctokit } from "@actions/github";
import * as fs from "fs";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("Missing GITHUB_TOKEN environment variable.");
  process.exit(1);
}
const octokit = getOctokit(token);

const report: Report = JSON.parse(fs.readFileSync("knip-output.json", "utf8"));

async function createAnnotations() {
  for (const issue of report.issues) {
    for (const key in issue) {
      if (Array.isArray(issue[key])) {
        for (const item of issue[key]) {
          if ("line" in item) {
            const annotation: CheckCreateParams = {
              owner: context.repo.owner,
              repo: context.repo.repo,
              head_sha: context.sha,
              name: "Knip Code Analysis",
              status: "completed", // This should be one of the specific string literals
              conclusion: "neutral", // This should be one of the specific string literals
              output: {
                title: "Knip Code Analysis Report",
                summary: "Analysis of unused code.",
                annotations: [
                  {
                    path: issue.file,
                    start_line: Number(item.line),
                    end_line: Number(item.line),
                    annotation_level: "warning",
                    message: `Unused code detected: ${item.name}`,
                  },
                ],
              },
            };

            await octokit.rest.checks.create(annotation);
          }
        }
      }
    }
  }
}

createAnnotations().catch((error) => {
  console.error("Failed to create annotations:", error);
  process.exit(1);
});

interface Issue {
  file: string;
  owners: string[];
  files: boolean;
  dependencies: string[];
  devDependencies: string[];
  optionalPeerDependencies: string[];
  unlisted: any[];
  binaries: any[];
  unresolved: any[];
  exports: Array<{ name: string; line?: number }>;
  types: Array<{ name: string; line?: number }>;
  enumMembers: Record<string, any[]>;
  classMembers: Record<string, any[]>;
  duplicates: any[];
}

interface Report {
  files: string[];
  issues: Issue[];
}

interface Annotation {
  path: string;
  start_line: number; // Ensure this is a number
  end_line: number; // Ensure this is a number
  annotation_level: "notice" | "warning" | "failure";
  message: string;
}

interface Output {
  title: string;
  summary: string;
  annotations: Annotation[];
}

interface CheckCreateParams {
  owner: string;
  repo: string;
  head_sha: string;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "action_required" | "cancelled" | "failure" | "neutral" | "success" | "skipped" | "stale" | "timed_out";
  output: Output;
}

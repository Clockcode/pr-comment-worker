import { execFileSync } from 'node:child_process';

function gh(args, opts = {}) {
  return execFileSync('gh', args, { encoding: 'utf8', ...opts });
}

export function listOpenPulls(repoFullName) {
  const out = gh(['pr', 'list', '--repo', repoFullName, '--state', 'open', '--json', 'number,headRefName,updatedAt,url']);
  return JSON.parse(out);
}

export function listIssueCommentsForPr(repoFullName, prNumber, sinceISO) {
  // GitHub REST: issues comments
  // GET /repos/{owner}/{repo}/issues/{issue_number}/comments?since=...
  const out = gh([
    'api',
    `repos/${repoFullName}/issues/${prNumber}/comments?since=${encodeURIComponent(sinceISO)}`,
    '--paginate',
    '-H', 'Accept: application/vnd.github+json'
  ]);
  return JSON.parse(out);
}

export function listReviewCommentsForPr(repoFullName, prNumber, sinceISO) {
  // GET /repos/{owner}/{repo}/pulls/{pull_number}/comments?since=...
  const out = gh([
    'api',
    `repos/${repoFullName}/pulls/${prNumber}/comments?since=${encodeURIComponent(sinceISO)}`,
    '--paginate',
    '-H', 'Accept: application/vnd.github+json'
  ]);
  return JSON.parse(out);
}

export function createIssueComment(repoFullName, prNumber, body) {
  const out = gh([
    'api',
    '-X', 'POST',
    `repos/${repoFullName}/issues/${prNumber}/comments`,
    '-H', 'Accept: application/vnd.github+json',
    '-f', `body=${body}`
  ]);
  return JSON.parse(out);
}

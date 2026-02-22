# PR Comment Worker (OpenClaw)

Cron-based GitHub PR comment worker that polls for new PR comments, applies minimal code changes using AI, pushes an update, and replies with the commit link.

## What it does

Every 10 minutes:
- Polls GitHub for new PR comments (review comments + PR conversation comments)
- Selects the first valid unprocessed comment
- Checks out the PR branch, rebases, generates a minimal patch with AI, applies it
- Runs `npm run lint` and `npm run build`
- If both pass: commits + pushes + replies to the comment with the commit link
- If either fails: does not push; replies with a short error summary

Processes **only one comment per run**.

## State

State file location:

- `~/.openclaw/pr-comment-worker-state.json`

Structure:
```json
{ "lastCursor": "ISO_TIMESTAMP", "processedCommentIds": ["comment_id"] }
```

Rules:
- Uses `since=lastCursor` when polling
- Skips processed IDs
- Caps processedCommentIds to 500
- Atomic writes
- Updates lastCursor after each poll

## Requirements

- `gh` CLI authenticated (uses existing environment)
- Node.js 18+ (for global `fetch`)
- Repo checkout(s) exist locally (dedicated automation workspace)

## Safety

- Never executes shell commands from comment content
- Never modifies files outside the repository
- Never pushes if build fails
- Resets workspace each run: `git reset --hard` + `git clean -fd`

## Setup

### 1) Configure repositories

Edit `config.json` and list the local repo paths to include.

### 2) Run once

```bash
node worker.js --dry-run
```

### 3) Install cron

See `cron.txt`.

## Environment variables

- `OPENAI_API_KEY` (required)
- Optional: `OPENAI_MODEL` (defaults in code)

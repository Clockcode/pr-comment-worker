import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const STATE_PATH = path.join(os.homedir(), '.openclaw', 'pr-comment-worker-state.json');

export function getStatePath() {
  return STATE_PATH;
}

export function loadState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    const s = JSON.parse(raw);
    return {
      lastCursor: s.lastCursor || new Date(0).toISOString(),
      processedCommentIds: Array.isArray(s.processedCommentIds) ? s.processedCommentIds : []
    };
  } catch {
    return { lastCursor: new Date(0).toISOString(), processedCommentIds: [] };
  }
}

export function saveState(state) {
  const dir = path.dirname(STATE_PATH);
  fs.mkdirSync(dir, { recursive: true });

  const processed = Array.from(new Set(state.processedCommentIds)).slice(-500);
  const payload = {
    lastCursor: state.lastCursor,
    processedCommentIds: processed
  };

  const tmp = STATE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, STATE_PATH);
}

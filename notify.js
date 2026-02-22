import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const QUEUE_PATH = path.join(os.homedir(), '.openclaw', 'pr-comment-worker-notify-queue.jsonl');

export function enqueueNotification(obj) {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
  fs.appendFileSync(QUEUE_PATH, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n', { mode: 0o600 });
}

export function getQueuePath() {
  return QUEUE_PATH;
}

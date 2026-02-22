#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const QUEUE_PATH = path.join(os.homedir(), '.openclaw', 'pr-comment-worker-notify-queue.jsonl');

function readLines(p) {
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  return raw.split('\n').filter(Boolean);
}

async function sendWhatsApp(text) {
  // Use OpenClaw's messaging by printing a sentinel JSON file for the main agent to pick up,
  // OR (preferred) run this script via OpenClaw agent tooling.
  // Here we simply print to stdout; OpenClaw cron wrapper will send.
  console.log(text);
}

async function main() {
  const lines = readLines(QUEUE_PATH);
  if (lines.length === 0) return;

  // Keep last 50, send and then truncate.
  const toSend = lines.slice(-50).map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);

  for (const ev of toSend) {
    if (ev.kind === 'success') {
      await sendWhatsApp(`✅ pr-comment-worker: addressed PR #${ev.prNumber} comment ${ev.commentId} – commit: ${ev.commitUrl}`);
    } else if (ev.kind === 'fatal') {
      await sendWhatsApp(`❌ pr-comment-worker: fatal error – ${String(ev.error).slice(0, 240)}`);
    }
  }

  fs.writeFileSync(QUEUE_PATH, '', { mode: 0o600 });
}

main().catch(err => {
  console.error(String(err));
  process.exitCode = 1;
});

import OpenAI from 'openai';

export function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  return new OpenAI({ apiKey: key });
}

export async function generatePatch({ client, model, instruction, repoSnapshot }) {
  // Minimal, deterministic: ask for unified diff only.
  const resp = await client.responses.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are a senior engineer. Produce a minimal unified diff patch only. ' +
          'No explanations. Only modify relevant files. Do not refactor unrelated code. ' +
          'Follow existing style and lint rules.'
      },
      {
        role: 'user',
        content:
          `Instruction from PR comment:\n${instruction}\n\n` +
          `Repository snapshot (selected files):\n${repoSnapshot}\n\n` +
          'Return ONLY a unified diff (git apply format).'
      }
    ]
  });

  const text = resp.output_text?.trim();
  if (!text) throw new Error('AI returned empty output');
  return text;
}

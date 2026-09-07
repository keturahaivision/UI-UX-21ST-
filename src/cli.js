#!/usr/bin/env node
// CLI: `render-agent "roll back api to the last good deploy"` or run with no task for a REPL.

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runAgent } from './agent.js';
import { createContext } from './context.js';

const HELP = `render-agent - Manus-style ops agent for Render, powered by Hugging Face open models

Usage:
  render-agent [options] "<task>"        run one task and exit
  render-agent [options]                 interactive session

Options:
  --yes, -y          auto mode: run every action, including suspend/delete, without asking
  --safe             safe mode: run reads and deploy/scale/env changes, deny destructive actions
  --read-only        only allow read tools
  --model <id>       Hugging Face model id (default: $HF_MODEL or Qwen/Qwen3-Coder-Next)
  --max-steps <n>    stop after n model turns (default 30)
  --quiet, -q        hide tool call progress
  --help, -h         show this help

Default mode is "ask": read tools run freely, anything that changes Render prompts for y/N.
Environment: HF_TOKEN, RENDER_API_KEY (see .env.example).`;

function parseArgs(argv) {
  const opts = { mode: 'ask', quiet: false, task: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') opts.mode = 'auto';
    else if (a === '--safe') opts.mode = 'safe';
    else if (a === '--read-only') opts.mode = 'read-only';
    else if (a === '--model') opts.model = argv[++i];
    else if (a === '--max-steps') opts.maxSteps = Number(argv[++i]);
    else if (a === '--quiet' || a === '-q') opts.quiet = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.task.push(a);
  }
  opts.task = opts.task.join(' ').trim();
  return opts;
}

const color = (code) => (s) => (output.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = color('2');
const cyan = color('36');
const yellow = color('33');
const red = color('31');
const green = color('32');

function printer(quiet) {
  return (ev) => {
    if (quiet && ev.type !== 'assistant') return;
    switch (ev.type) {
      case 'thought':
        console.log(dim(`  ${ev.content}`));
        break;
      case 'tool_call':
        console.log(cyan(`  → ${ev.name}`) + dim(` ${JSON.stringify(ev.args)}`));
        break;
      case 'tool_result':
        console.log(dim(`    ✓ ${ev.preview.replace(/\s+/g, ' ').slice(0, 160)}`));
        break;
      case 'tool_denied':
        console.log(yellow(`    ✗ denied by policy (${ev.risk})`));
        break;
      case 'tool_error':
        console.log(red(`    ✗ ${ev.error}`));
        break;
      case 'assistant':
        console.log(`\n${ev.content}\n`);
        break;
      default:
        break;
    }
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return;
  }

  const { llm, tools } = createContext({ model: opts.model });
  const rl = readline.createInterface({ input, output });

  const policy = {
    mode: opts.mode,
    approve: async (tool, args) => {
      const answer = await rl.question(
        yellow(`\n  ${tool.risk.toUpperCase()} action: ${tool.name} ${JSON.stringify(args)}\n  Run it? [y/N] `),
      );
      return /^y(es)?$/i.test(answer.trim());
    },
  };

  const onEvent = printer(opts.quiet);
  let messages = [];

  const runTask = async (task) => {
    messages.push({ role: 'user', content: task });
    try {
      const result = await runAgent({ llm, tools, messages, policy, onEvent, maxSteps: opts.maxSteps });
      messages = result.messages;
    } catch (err) {
      console.error(red(`\nAgent error: ${err.message}`));
      if (!opts.task) messages.pop();
      else process.exitCode = 1;
    }
  };

  if (opts.task) {
    console.log(dim(`model: ${llm.model} · mode: ${opts.mode}`));
    await runTask(opts.task);
    rl.close();
    return;
  }

  console.log(green('Render Agent') + dim(` · model ${llm.model} · mode ${opts.mode} · type "exit" to quit`));
  for (;;) {
    const line = (await rl.question(green('\nyou › '))).trim();
    if (!line) continue;
    if (['exit', 'quit', ':q'].includes(line.toLowerCase())) break;
    await runTask(line);
  }
  rl.close();
}

main().catch((err) => {
  console.error(red(err.message));
  process.exit(1);
});

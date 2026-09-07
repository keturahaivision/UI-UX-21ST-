#!/usr/bin/env node
// MCP server for Claude Code (stdio). Exposes every Render tool plus `render_agent_run`,
// which delegates a whole task to the Hugging Face-powered agent and returns its report.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runAgent } from './agent.js';
import { createContext, maxMode } from './context.js';
import { authorize, clampMode } from './tools.js';

const ctx = createContext();
const ceiling = maxMode();

const agentTool = {
  name: 'render_agent_run',
  description:
    `Delegate a production task to Render Agent, an autonomous SRE agent running on an open model via Hugging Face (${ctx.llm.model}). ` +
    'It plans, calls Render tools, verifies the outcome, and returns a report. Good for multi-step work like "diagnose why api is failing and roll back if needed".',
  parameters: {
    type: 'object',
    properties: {
      task: { type: 'string', description: 'What to accomplish, in plain language' },
      mode: {
        type: 'string',
        enum: ['read-only', 'safe', 'auto'],
        description: `Permission mode; clamped to AGENT_MAX_MODE (currently "${ceiling}")`,
      },
    },
    required: ['task'],
    additionalProperties: false,
  },
};

const server = new Server({ name: 'render-agent', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [agentTool, ...ctx.tools].map((t) => ({
    name: t.name,
    description: t.risk ? `[${t.risk}] ${t.description}` : t.description,
    inputSchema: t.parameters,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    if (name === agentTool.name) {
      const transcript = [];
      const onEvent = (ev) => {
        if (ev.type === 'tool_call') transcript.push(`→ ${ev.name} ${JSON.stringify(ev.args)}`);
        if (ev.type === 'tool_denied') transcript.push(`  ✗ denied (${ev.risk})`);
        if (ev.type === 'tool_error') transcript.push(`  ✗ ${ev.error}`);
      };
      const result = await runAgent({
        llm: ctx.llm,
        tools: ctx.tools,
        messages: [{ role: 'user', content: String(args.task) }],
        policy: { mode: clampMode(args.mode || 'safe', ceiling) },
        onEvent,
      });
      const text = `${result.content}\n\n---\nSteps (${result.steps}):\n${transcript.join('\n') || '(no tool calls)'}`;
      return { content: [{ type: 'text', text }] };
    }

    const tool = ctx.tools.find((t) => t.name === name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    if (!(await authorize(tool, args, { mode: ceiling }))) {
      throw new Error(`"${name}" is a ${tool.risk} action; AGENT_MAX_MODE="${ceiling}" does not allow it.`);
    }
    const out = await tool.run(args);
    return { content: [{ type: 'text', text: JSON.stringify(out ?? { ok: true }, null, 2) }] };
  } catch (err) {
    return { isError: true, content: [{ type: 'text', text: err.message }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

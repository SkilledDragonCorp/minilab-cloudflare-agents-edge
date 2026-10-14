#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateEdgeAgentPolicy } from "./policy.ts";

const path = resolve(process.argv[2] ?? "fixtures/edge-agent-policy.json");
const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
const result = validateEdgeAgentPolicy(raw);

if (!result.ok) {
  console.error(`edge-agent-policy FAIL: ${path}`);
  for (const issue of result.issues) {
    console.error(`  - ${issue.key}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`edge-agent-policy OK: ${path}`);
console.log(
  JSON.stringify(
    {
      secretsFromEnv: result.policy!.secretsFromEnv.length,
      toolAllowlist: result.policy!.toolAllowlist.length,
      egressAllowlist: result.policy!.egressAllowlist.length,
      noLocalLooseAgent: result.policy!.noLocalLooseAgent,
    },
    null,
    2,
  ),
);

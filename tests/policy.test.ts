import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  REQUIRED_KEYS,
  validateEdgeAgentPolicy,
} from "../src/policy.ts";

const root = join(import.meta.dir, "..");
const fixturePath = join(root, "fixtures", "edge-agent-policy.json");

describe("edge-agent-policy fixture", () => {
  test("fixture validates with all required keys non-empty", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8")) as unknown;
    const result = validateEdgeAgentPolicy(raw);
    expect(result.ok).toBe(true);
    expect(result.policy).toBeDefined();
    for (const key of REQUIRED_KEYS) {
      expect(result.policy).toHaveProperty(key);
    }
    expect(result.policy!.secretsFromEnv.length).toBeGreaterThan(0);
    expect(result.policy!.toolAllowlist.length).toBeGreaterThan(0);
    expect(result.policy!.egressAllowlist.length).toBeGreaterThan(0);
    expect(result.policy!.noLocalLooseAgent).toBe(true);
  });

  test("rejects missing secretsFromEnv", () => {
    const result = validateEdgeAgentPolicy({
      toolAllowlist: ["fetch"],
      egressAllowlist: ["api.cloudflare.com"],
      noLocalLooseAgent: true,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.key === "secretsFromEnv")).toBe(true);
  });

  test("rejects empty toolAllowlist", () => {
    const result = validateEdgeAgentPolicy({
      secretsFromEnv: ["CLOUDFLARE_API_TOKEN"],
      toolAllowlist: [],
      egressAllowlist: ["api.cloudflare.com"],
      noLocalLooseAgent: true,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.key === "toolAllowlist")).toBe(true);
  });

  test("rejects noLocalLooseAgent false", () => {
    const result = validateEdgeAgentPolicy({
      secretsFromEnv: ["CLOUDFLARE_API_TOKEN"],
      toolAllowlist: ["fetch"],
      egressAllowlist: ["api.cloudflare.com"],
      noLocalLooseAgent: false,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.key === "noLocalLooseAgent")).toBe(true);
  });
});

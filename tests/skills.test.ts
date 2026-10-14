import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

describe("skills layout", () => {
  test("edge-agent-policy SKILL.md has name and description frontmatter", () => {
    const skillPath = join(root, ".claude", "skills", "edge-agent-policy", "SKILL.md");
    expect(existsSync(skillPath)).toBe(true);
    const text = readFileSync(skillPath, "utf8");
    expect(text.startsWith("---\n")).toBe(true);
    expect(text).toContain("name: edge-agent-policy");
    expect(text).toMatch(/description:\s+\S/);
  });

  test("forbidden skill mirrors are absent", () => {
    expect(existsSync(join(root, ".cursor", "skills"))).toBe(false);
    expect(existsSync(join(root, ".agents", "skills"))).toBe(false);
  });
});

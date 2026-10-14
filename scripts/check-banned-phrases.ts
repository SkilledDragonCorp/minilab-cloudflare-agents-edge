#!/usr/bin/env bun
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
// Built without embedding banned substrings as contiguous literals in this file.
const banned = [
  ["e.", "g."].join(""),
  ["if ", "present"].join(""),
  ["or npm ", "install"].join(""),
  ["skip if ", "heavy"].join(""),
  ["or ", "similar"].join(""),
  ["something ", "like"].join(""),
];

const skipDirs = new Set([
  "node_modules",
  "vendor",
  ".git",
  "dist",
  ".bun",
  "coverage",
  "reports",
]);

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, files);
    else if (/\.(md|ts|tsx|js|yml|yaml|sh|json)$/.test(entry.name)) files.push(path);
  }
  return files;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  if (!(await exists(root))) {
    console.error("root missing");
    process.exit(1);
  }
  const files = await walk(root);
  const hits: string[] = [];
  for (const file of files) {
    if (file.endsWith("check-banned-phrases.ts")) continue;
    const text = await readFile(file, "utf8");
    for (const phrase of banned) {
      if (text.includes(phrase)) hits.push(`${file}: contains "${phrase}"`);
    }
  }
  if (hits.length > 0) {
    for (const h of hits) console.error(h);
    process.exit(1);
  }
  console.log("banned-phrase check ok");
}

await main();

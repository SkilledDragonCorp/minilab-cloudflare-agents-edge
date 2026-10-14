/** Edge-agent least-privilege policy checklist. */

export const REQUIRED_KEYS = [
  "secretsFromEnv",
  "toolAllowlist",
  "egressAllowlist",
  "noLocalLooseAgent",
] as const;

export type RequiredKey = (typeof REQUIRED_KEYS)[number];

export type EdgeAgentPolicy = {
  secretsFromEnv: string[];
  toolAllowlist: string[];
  egressAllowlist: string[];
  noLocalLooseAgent: boolean;
};

export type PolicyIssue = {
  key: string;
  message: string;
};

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

export function validateEdgeAgentPolicy(raw: unknown): {
  ok: boolean;
  policy?: EdgeAgentPolicy;
  issues: PolicyIssue[];
} {
  const issues: PolicyIssue[] = [];

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      issues: [{ key: "<root>", message: "policy must be a JSON object" }],
    };
  }

  const obj = raw as Record<string, unknown>;

  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) {
      issues.push({ key, message: "missing required key" });
    }
  }

  if (!isNonEmptyStringArray(obj.secretsFromEnv)) {
    issues.push({
      key: "secretsFromEnv",
      message: "must be a non-empty string array",
    });
  }

  if (!isNonEmptyStringArray(obj.toolAllowlist)) {
    issues.push({
      key: "toolAllowlist",
      message: "must be a non-empty string array",
    });
  }

  if (!isNonEmptyStringArray(obj.egressAllowlist)) {
    issues.push({
      key: "egressAllowlist",
      message: "must be a non-empty string array",
    });
  }

  if (typeof obj.noLocalLooseAgent !== "boolean") {
    issues.push({
      key: "noLocalLooseAgent",
      message: "must be a boolean",
    });
  } else if (obj.noLocalLooseAgent !== true) {
    issues.push({
      key: "noLocalLooseAgent",
      message: "must be true (edge deploy required; laptop-loose agent banned)",
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    policy: {
      secretsFromEnv: obj.secretsFromEnv as string[],
      toolAllowlist: obj.toolAllowlist as string[],
      egressAllowlist: obj.egressAllowlist as string[],
      noLocalLooseAgent: true,
    },
    issues: [],
  };
}

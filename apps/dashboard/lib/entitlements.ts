export const PLAN_ORDER = ["Starter", "Pro", "Scale"] as const;

export type CustomerPlan = (typeof PLAN_ORDER)[number];

export type PlatformFeature =
  | "core-payments"
  | "tool-manifest"
  | "sponsored-pay"
  | "analytics"
  | "team-admin"
  | "audit-export";

const PLAN_FEATURES: Record<CustomerPlan, PlatformFeature[]> = {
  Starter: ["core-payments", "tool-manifest"],
  Pro: ["core-payments", "tool-manifest", "sponsored-pay", "analytics"],
  Scale: ["core-payments", "tool-manifest", "sponsored-pay", "analytics", "team-admin", "audit-export"]
};

export function normalizePlan(value?: string | null): CustomerPlan {
  if (value === "Pro" || value === "Scale") {
    return value;
  }
  return "Starter";
}

export function hasFeature(plan: string | null | undefined, feature: PlatformFeature): boolean {
  return PLAN_FEATURES[normalizePlan(plan)].includes(feature);
}

export function getEntitlements(plan: string | null | undefined) {
  const normalized = normalizePlan(plan);
  const features = PLAN_FEATURES[normalized];

  return {
    plan: normalized,
    corePayments: true,
    toolManifest: features.includes("tool-manifest"),
    sponsoredPay: features.includes("sponsored-pay"),
    analytics: features.includes("analytics"),
    teamAdmin: features.includes("team-admin"),
    auditExport: features.includes("audit-export")
  };
}

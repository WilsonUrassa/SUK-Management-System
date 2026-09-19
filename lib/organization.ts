export type OrganizationProfile = {
  name: string;
  organizationType: string;
  currency: string;
  timezone: string;
  branchName: string;
};

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export function defaultModules(type: string) {
  const common = ["organizations","users","finance","hr","attendance","documents","reports","notifications"];
  const map: Record<string,string[]> = {
    School: ["school","inventory"],
    "Office / Company": ["office","inventory","customers"],
    Restaurant: ["restaurant","inventory","customers"],
    "NGO / Nonprofit": ["ngo","customers"],
    "Retail / Shop": ["retail","inventory","customers"],
    Hotel: ["hotel","inventory","customers"],
    Clinic: ["clinic","inventory","customers"],
    Warehouse: ["warehouse","inventory","customers"],
    "Service Business": ["service-business","customers"],
    Other: ["customers"]
  };
  return Array.from(new Set([...common, ...(map[type] ?? map.Other)]));
}
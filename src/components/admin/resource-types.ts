export type ResourceActionField = {
  name: string;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  valueType?: "string" | "boolean" | "number";
};

export type ResourceActionCondition = {
  key: string;
  in?: string[];
  notIn?: string[];
};

export type ResourceAction = {
  id: string;
  label: string;
  description?: string;
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  body?: Record<string, unknown>;
  fields?: ResourceActionField[];
  submitLabel?: string;
  successMessage?: string;
  variant?: "default" | "destructive";
  when?: ResourceActionCondition;
};

export type LinkedResourceColumn = {
  hrefBase: string;
  idKey?: string;
};

export function resolveRecordEndpoint(template: string, row: Record<string, unknown>, idKey = "id"): string {
  return template.replaceAll(/\{([^}]+)\}/g, (_placeholder, key: string) => {
    const value = row[key === "id" ? idKey : key];
    if (value === null || value === undefined || value === "") {
      throw new Error(`Missing ${key} for this action.`);
    }
    return encodeURIComponent(String(value));
  });
}

export function isResourceActionAvailable(action: ResourceAction, row: Record<string, unknown>): boolean {
  if (!action.when) return true;
  const value = String(row[action.when.key] ?? "");
  if (action.when.in && !action.when.in.includes(value)) return false;
  if (action.when.notIn?.includes(value)) return false;
  return true;
}

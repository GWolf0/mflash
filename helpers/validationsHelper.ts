import { DECK_CATEGORIES } from "@/constants/deckAndCardsConstants";
import { CARD_MAX_SCORE } from "@/constants/deckConstants";
import limitsConstants from "@/constants/limitsConstants";
import { ObjectId } from "mongodb";
import { z } from "zod";


// Helper functions
export function zodPick(schema: z.ZodObject<any> | undefined, fields: string[] | undefined): z.ZodObject<any> | undefined{
    if(!schema) return undefined;
    if(!fields) return schema;

    return schema.pick(Object.fromEntries(fields.map((f) => [f, true])));
}

export function zodGetInputAttributes(schema: z.ZodTypeAny) {
  const attrs: Record<string, any> = {};

  // Required or not
  if (schema.isOptional() || schema.isNullable()) {
    attrs.required = false;
  } else {
    attrs.required = true;
  }

  // String schema
  if (schema.def.type === "string") {
    const checks = schema.def.checks as any[];
    for (const check of checks) {
      if (check.kind === "min") attrs.minLength = check.value;
      if (check.kind === "max") attrs.maxLength = check.value;
      if (check.kind === "regex") attrs.pattern = check.regex.source;
    }
  }

  // Number schema
  if (schema.def.type === "number") {
    const checks = schema.def.checks as any[];
    for (const check of checks) {
      if (check.kind === "min") attrs.min = check.value;
      if (check.kind === "max") attrs.max = check.value;
    }
  }

  return attrs;
}

// zod error to message
export function formatZodError(error: z.ZodError | undefined): string {
  if(!error) return "Unknown validation error";
  return error.issues.map((err) => {
      const path = err.path.join(".");
      const message = err.message;
      return path ? `Field "${path}": ${message}` : `Error: ${message}`;
  }).join("\n");
}

import { Dictionary } from "../types/utility";

export type NestSchema = Dictionary<[string, string]>;

/**
 * Nests an object using a 'schema' for reference.
 *
 * @param obj - The obj to be nested
 * @param schema - The schema to user for nesting
 * @returns The nested object
 */
export function nest(obj: any, schema: NestSchema): any {
  const allKeys = [...new Set([...Object.keys(obj), ...Object.keys(schema)])];
  return allKeys.reduce((acc, key) => {
    if (!schema[key]) {
      acc[key] = obj[key];
      return acc;
    }

    if (!obj[key]) {
      return acc;
    }

    const [topNest, bottomNest] = schema[key];
    if (!acc[topNest]) {
      acc[topNest] = {};
    }
    acc[topNest][bottomNest] = obj[key];
    return acc;
  }, {});
}

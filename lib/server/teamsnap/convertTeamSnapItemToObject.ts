import camelCase from "lodash/camelCase";

export default function convertTeamSnapItemToObject(
  input:
    | { data: Array<{ name: string; type: string; value: any }> }
    | undefined
    | null
): any {
  if (!input) return null;

  const data: any = {};
  for (const { name, type, value } of input.data) {
    data[camelCase(name)] =
      type === "DateTime" && value ? new Date(value) : value;
  }
  return data;
}

import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
}

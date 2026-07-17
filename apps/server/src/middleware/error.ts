import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { AppError } from "../errors.ts";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof AppError) {
    return c.json(
      {
        error: error.code,
        message: error.message,
      },
      error.status,
    );
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        error: "VALIDATION_ERROR",
        issues: error.issues,
      },
      400,
    );
  }

  console.error(error);

  return c.json(
    {
      error: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    },
    500,
  );
};

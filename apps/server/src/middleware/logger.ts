import type { MiddlewareHandler } from "hono";

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const startedAt = Date.now();
  await next();
  const elapsedMs = Date.now() - startedAt;

  console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${elapsedMs}ms`);
};

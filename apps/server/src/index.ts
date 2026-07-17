import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { config } from "./config/env.ts";

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`BboyArena server listening on http://localhost:${info.port}`);
  },
);

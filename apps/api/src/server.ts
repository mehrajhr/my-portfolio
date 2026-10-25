import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (process.env.NODE_ENV === "production" && (process.env.SESSION_SECRET?.length ?? 0) < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters in production");
}
createApp().listen(port, "0.0.0.0", () => console.log(`Portfolio API listening on 0.0.0.0:${port}`));

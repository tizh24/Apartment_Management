import { createConfiguredNestApp } from "./nest-app";

async function bootstrap(): Promise<void> {
  const app = await createConfiguredNestApp();

  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.APP_HOST ?? "0.0.0.0";

  await app.listen(port, host);
  console.log(`API is running on http://${host}:${port}/api/v1`);
}

void bootstrap().catch((error) => {
  console.error("[Bootstrap Error]", error);
  process.exit(1);
});

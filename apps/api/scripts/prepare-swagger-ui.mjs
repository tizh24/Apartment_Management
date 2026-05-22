import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRootDir = dirname(scriptDir);

async function resolveSwaggerUiDistDir() {
  try {
    const packageJsonUrl = await import.meta.resolve("swagger-ui-dist/package.json");
    return dirname(fileURLToPath(packageJsonUrl));
  } catch {
    const fallbackDir = join(appRootDir, "../../node_modules/.pnpm/swagger-ui-dist@5.32.6/node_modules/swagger-ui-dist");

    if (!existsSync(fallbackDir)) {
      throw new Error("Unable to resolve swagger-ui-dist assets");
    }

    return fallbackDir;
  }
}

const swaggerUiDistDir = await resolveSwaggerUiDistDir();
const targetDir = join(appRootDir, "swagger-ui");

const filesToCopy = [
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
];

if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

mkdirSync(targetDir, { recursive: true });

for (const file of filesToCopy) {
  cpSync(join(swaggerUiDistDir, file), join(targetDir, file));
}

import { mkdir, rename, rm, copyFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const webDir = resolve(repoRoot, "web");
const webBrandingDir = resolve(webDir, "branding");
const sourceEntry = resolve(repoRoot, "src", "main.js");
const modelNotes = resolve(repoRoot, "public", "model-notes.html");
const usydLogo = resolve(repoRoot, "public", "branding", "usyd-logo.png");
const bunPath = resolve(homedir(), ".bun", "bin", "bun");

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Braess</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="./main.bundle.js"></script>
  </body>
</html>
`;

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
await mkdir(webBrandingDir, { recursive: true });

await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn(
    bunPath,
    ["build", sourceEntry, "--format", "iife", "--target", "browser", "--outdir", webDir],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );

  child.on("exit", (code) => {
    if (code === 0) {
      resolvePromise();
      return;
    }
    rejectPromise(new Error(`bun build exited with code ${code}`));
  });
  child.on("error", rejectPromise);
});

await rename(resolve(webDir, "main.js"), resolve(webDir, "main.bundle.js"));
await rename(resolve(webDir, "main.css"), resolve(webDir, "style.css"));
await copyFile(modelNotes, resolve(webDir, "model-notes.html"));
await copyFile(usydLogo, resolve(webBrandingDir, "usyd-logo.png"));
await writeFile(resolve(webDir, "index.html"), indexHtml, "utf8");

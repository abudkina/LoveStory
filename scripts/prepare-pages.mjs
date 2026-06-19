import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { join, basename } from "path";

writeFileSync("out/.nojekyll", "");

if (!existsSync("out/index.html")) {
  console.error("out/index.html not found");
  process.exit(1);
}

copyFileSync("out/index.html", "out/404.html");

function routeDirs(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_") || name === "404.html") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      copyFileSync("out/404.html", join(full, "404.html"));
      routeDirs(full);
      continue;
    }
    if (!name.endsWith(".html") || name === "index.html") continue;
    const route = basename(name, ".html");
    const routeDir = join(dir, route);
    mkdirSync(routeDir, { recursive: true });
    copyFileSync(full, join(routeDir, "index.html"));
    copyFileSync("out/404.html", join(routeDir, "404.html"));
  }
}

routeDirs("out");

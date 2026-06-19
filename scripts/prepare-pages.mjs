import { copyFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

writeFileSync("out/.nojekyll", "");

if (!existsSync("out/index.html")) {
  console.error("out/index.html not found");
  process.exit(1);
}

copyFileSync("out/index.html", "out/404.html");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_") || name === "404.html") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      copyFileSync("out/404.html", join(full, "404.html"));
      walk(full);
    }
  }
}

walk("out");

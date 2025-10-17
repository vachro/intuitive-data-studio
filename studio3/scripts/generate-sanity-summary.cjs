/* eslint-env node */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");
const ignore = require("ignore");

// ----------------------------
// CONFIG
// ----------------------------
const ROOT = path.resolve(__dirname, "..");
const OUT_MD = path.join(ROOT, "sanity_summary.md");
const MAX_BYTES_PER_FILE = 200_000;

const INCLUDE_EXTS = new Set([
  ".ts",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
]);

const ALWAYS_EXCLUDE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.idea/**",
  "**/.vscode/**",
  "**/.sanity/**",
  "**/dist/**",
  "**/build/**",
  "**/static/**",
  "**/attached_assets/**",
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.webp",
  "**/*.avif",
  "**/*.pdf",
  "**/*.zip",
  "**/*.ico",
  "**/*.ttf",
  "**/*.woff",
  "**/*.woff2",
  "**/*.mp3",
  "**/*.mp4",
  "**/*.mov",
  "**/*.heic",
];

const IMPORTANT_FILES = [
  "sanity.config.ts",
  "sanity.cli.ts",
  "vite.config.ts",
  "tsconfig.json",
  ".env",
  ".env.local.template",
  "README.md",
  "TRANSLATIONS.md",
];

// ----------------------------
// HELPERS
// ----------------------------
function isTextlike(filePath) {
  return INCLUDE_EXTS.has(path.extname(filePath).toLowerCase());
}

async function loadGitignore(root) {
  try {
    const raw = await fsp.readFile(path.join(root, ".gitignore"), "utf8");
    return ignore().add(raw);
  } catch {
    return ignore();
  }
}

// ----------------------------
// MAIN
// ----------------------------
(async () => {
  console.log("🧭 Generating Sanity project summary...");
  const ig = await loadGitignore(ROOT);

  // Finn alle filer
  const entries = await fg(["**/*"], {
    cwd: ROOT,
    dot: true,
    onlyFiles: true,
    ignore: ALWAYS_EXCLUDE,
  });

  const filtered = ig.filter(entries);
  const textFiles = filtered.filter(isTextlike);
  const summaryLines = [];

  // HEADER
  summaryLines.push(`# 🧭 Sanity Project Summary`);
  summaryLines.push(`**Root:** ${ROOT}`);
  summaryLines.push("");
  summaryLines.push(`Total files (after ignore): ${filtered.length}`);
  summaryLines.push(`Text-based files included: ${textFiles.length}`);
  summaryLines.push(``);

  // Directory overview
  summaryLines.push("## 📂 Directory Structure");
  summaryLines.push(filtered.map((f) => "  " + f).join("\n"));
  summaryLines.push("");

  // README excerpt
  const readmePath = path.join(ROOT, "README.md");
  if (fs.existsSync(readmePath)) {
    const readme = (await fsp.readFile(readmePath, "utf8"))
      .split("\n")
      .slice(0, 20)
      .join("\n");
    summaryLines.push(`## 📝 README excerpt\n${readme}\n`);
  }

  // Important config files
  summaryLines.push("## ⚙️ Important Files");
  for (const file of IMPORTANT_FILES) {
    if (fs.existsSync(path.join(ROOT, file))) summaryLines.push(`- ${file}`);
  }
  summaryLines.push("");

  // Dependencies
  const pkgPath = path.join(ROOT, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(await fsp.readFile(pkgPath, "utf8"));
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const scripts = pkg.scripts ? Object.keys(pkg.scripts) : [];

    summaryLines.push("## 📦 Dependencies");
    summaryLines.push(`**Dependencies:** ${deps.join(", ") || "None"}`);
    summaryLines.push(`**DevDependencies:** ${devDeps.join(", ") || "None"}`);
    summaryLines.push("");

    if (scripts.length) {
      summaryLines.push("## 🧰 NPM Scripts");
      for (const s of scripts) summaryLines.push(`- ${s}: ${pkg.scripts[s]}`);
      summaryLines.push("");
    }
  }

  // Plugins
  const pluginsDir = path.join(ROOT, "plugins");
  if (fs.existsSync(pluginsDir)) {
    const pluginFiles = await fg(["plugins/**/*.{ts,js}"], { cwd: ROOT });
    if (pluginFiles.length) {
      summaryLines.push("## 🧩 Sanity Plugins");
      for (const rel of pluginFiles) {
        const abs = path.join(ROOT, rel);
        const snippet = (await fsp.readFile(abs, "utf8"))
          .split("\n")
          .slice(0, 15)
          .join("\n");
        summaryLines.push(`\n### 📄 ${rel}`);
        summaryLines.push("```");
        summaryLines.push(snippet);
        summaryLines.push("```");
      }
    }
  }

  // Schema types
  const schemaDir = path.join(ROOT, "schemaTypes");
  if (fs.existsSync(schemaDir)) {
    const schemaFiles = await fg(["schemaTypes/**/*.{ts,js}"], { cwd: ROOT });
    if (schemaFiles.length) {
      summaryLines.push("## 🧱 Schema Types");
      for (const rel of schemaFiles) {
        const abs = path.join(ROOT, rel);
        const snippet = (await fsp.readFile(abs, "utf8"))
          .split("\n")
          .slice(0, 15)
          .join("\n");
        summaryLines.push(`\n### 🧩 ${rel}`);
        summaryLines.push("```");
        summaryLines.push(snippet);
        summaryLines.push("```");
      }
    }
  }

  // translateAction.ts
  const translateActionPath = path.join(ROOT, "translateAction.ts");
  if (fs.existsSync(translateActionPath)) {
    const content = await fsp.readFile(translateActionPath, "utf8");
    const snippet = content.split("\n").slice(0, 20).join("\n");
    summaryLines.push("## 🌍 Custom Actions");
    summaryLines.push("### translateAction.ts");
    summaryLines.push("```");
    summaryLines.push(snippet);
    summaryLines.push("```");
  }

  // Write markdown
  await fsp.writeFile(OUT_MD, summaryLines.join("\n"), "utf8");
  console.log(`✅ Sanity summary written to: ${path.relative(ROOT, OUT_MD)}`);
})();

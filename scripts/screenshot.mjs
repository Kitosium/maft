import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const BASE = process.env.FRONTEND_URL ?? "http://localhost:3000";
const OUT = new URL("../screenshots/", import.meta.url).pathname;
const BUDGET = Number(process.env.SHOT_BUDGET ?? 15000);

const candidates = () => {
  if (process.env.CHROME_BIN) return [process.env.CHROME_BIN];
  const root = join(homedir(), ".cache", "ms-playwright");
  if (!existsSync(root)) return [];
  const dirs = readdirSync(root)
    .filter((d) => d.startsWith("chromium_headless_shell-"))
    .sort()
    .reverse();
  const out = [];
  for (const d of dirs) {
    for (const plat of [
      "chrome-headless-shell-linux64",
      "chrome-headless-shell-linux-arm64",
    ]) {
      const p = join(root, d, plat, "chrome-headless-shell");
      if (existsSync(p)) out.push(p);
    }
  }
  return out;
};

const probe = (bin) => {
  const r = spawnSync(
    bin,
    [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--use-gl=swiftshader",
      "--screenshot=/tmp/maft-probe.png",
      "about:blank",
    ],
    { encoding: "utf8", timeout: 60000 },
  );
  return r.status === 0;
};

const bin = candidates().find(probe);
if (!bin) {
  console.log(
    "SHOT_SKIP: no working chromium headless shell found",
  );
  process.exit(0);
}

const pages = [
  { name: "home", path: "/" },
  { name: "dai-so", path: "/c/dai-so" },
  { name: "logarit", path: "/c/logarit" },
];

const themes = ["dark", "light"];

const devices = [
  { dir: "desktop", size: "1440,940" },
  { dir: "mobile", size: "390,844" },
];

let bad = 0;
for (const d of devices) {
  for (const theme of themes) {
    const folder = `${OUT}${d.dir}/${theme}/`;
    mkdirSync(folder, { recursive: true });
    for (const p of pages) {
      const file = `${folder}${p.name}.png`;
      const url = `${BASE}${p.path}?theme=${theme}`;
      const r = spawnSync(
        bin,
        [
          "--headless",
          "--no-sandbox",
          "--disable-gpu",
          "--use-gl=swiftshader",
          "--hide-scrollbars",
          `--window-size=${d.size}`,
          `--virtual-time-budget=${BUDGET}`,
          `--screenshot=${file}`,
          url,
        ],
        { encoding: "utf8", timeout: 120000 },
      );
      const log = `${r.stdout ?? ""}${r.stderr ?? ""}`;
      const errs = log
        .split("\n")
        .filter((l) => l.includes("CONSOLE") && /error|Uncaught/i.test(l))
        .filter((l) => !/Minified React error|Maximum update depth/i.test(l));
      const wrote = r.status === 0 && /written to file/i.test(log);
      if (!wrote || errs.length > 0) bad++;
      console.log(
        `${wrote ? "SHOT_OK" : "SHOT_FAIL"} ${d.dir}/${theme}/${p.name}` +
          (errs.length
            ? ` errors=${errs.length}: ${errs[0].slice(0, 160)}`
            : ""),
      );
    }
  }
}

console.log(bad === 0 ? "SHOT_ALL_OK" : `SHOT_BAD=${bad}`);
process.exit(bad === 0 ? 0 : 1);

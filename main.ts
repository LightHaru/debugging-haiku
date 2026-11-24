import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HAIKU_LINES: readonly string[] = [
  "Tests pass on my branch—",
  "production fails the same way.",
  "I forgot to push.",
];

const outDir: string =
  process.argv[2] ?? process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), HAIKU_LINES.join("\n") + "\n", "utf8");

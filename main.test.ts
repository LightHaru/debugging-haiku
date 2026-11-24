import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const main = fileURLToPath(new URL("./main.ts", import.meta.url));

function generate(): { dir: string; text: string } {
  const dir = mkdtempSync(join(tmpdir(), "haiku-"));
  try {
    execFileSync(process.execPath, [main, dir]);
    return { dir, text: readFileSync(join(dir, "entry.txt"), "utf8") };
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw err;
  }
}

test("writes a deterministic, valid artifact to <dir>/entry.txt", () => {
  const first = generate();
  const second = generate();
  try {
    assert.equal(first.text, second.text, "two runs must be identical");

    const lines = first.text.split("\n").filter((line) => line.trim().length > 0);
    assert.equal(lines.length, 3, "artifact must hold 3 nonempty lines");

    const bytes = Buffer.byteLength(first.text, "utf8");
    assert.ok(bytes > 0 && bytes <= 200, `entry must be 1-200 UTF-8 chars, got ${bytes}`);
    assert.ok(first.text.trim().length > 0, "entry must not be only whitespace");
  } finally {
    rmSync(first.dir, { recursive: true, force: true });
    rmSync(second.dir, { recursive: true, force: true });
  }
});

test("honors the output directory argument", () => {
  const { dir } = generate();
  try {
    const stat = readFileSync(join(dir, "entry.txt"));
    assert.ok(stat.length > 0, "entry.txt must exist at the given output path");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

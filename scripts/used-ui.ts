import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { computeUsed, type Source } from "./used-ui-lib";

function collect(dir: string): Source[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collect(path);
    return /\.tsx?$/.test(entry.name)
      ? [{ path, text: readFileSync(path, "utf8") }]
      : [];
  });
}

const result = computeUsed(collect("src"));
writeFileSync(
  "src/components/showcase/used.generated.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(
  `showcase: ${result.used.length}/${result.ui.length} ui components in use`,
);

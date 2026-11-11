export type Source = { path: string; text: string };

const UI_DIR = "src/components/ui/";
const SHOWCASE_DIR = "src/components/showcase/";
const ALIAS_IMPORT = /["']@\/components\/ui\/([\w-]+)["']/g;
const SIBLING_IMPORT = /["']\.\/([\w-]+)["']/g;

const names = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[1]);

export function computeUsed(files: Source[]): { ui: string[]; used: string[] } {
  const uiFiles = new Map<string, string>();
  for (const { path, text } of files) {
    const match = path.startsWith(UI_DIR) && path.match(/\/([\w-]+)\.tsx?$/);
    if (match) uiFiles.set(match[1], text);
  }

  const queue = files
    .filter(
      ({ path }) => !path.startsWith(UI_DIR) && !path.startsWith(SHOWCASE_DIR),
    )
    .flatMap(({ text }) => names(text, ALIAS_IMPORT));

  const used = new Set<string>();
  for (let name = queue.pop(); name !== undefined; name = queue.pop()) {
    const text = uiFiles.get(name);
    if (text === undefined || used.has(name)) continue;
    used.add(name);
    queue.push(...names(text, ALIAS_IMPORT), ...names(text, SIBLING_IMPORT));
  }

  return { ui: [...uiFiles.keys()].sort(), used: [...used].sort() };
}

import { promises as fs } from "fs";
import path from "path";

const writeQueues = new Map<string, Promise<void>>();

const ensureFile = async (filePath: string): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf-8");
  }
};

export const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  await ensureFile(filePath);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return raw.trim() ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJsonFile = async <T>(filePath: string, value: T): Promise<void> => {
  await ensureFile(filePath);
  const previous = writeQueues.get(filePath) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
    });
  writeQueues.set(filePath, next);
  await next;
};

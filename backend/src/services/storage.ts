import path from "path";
import { mkdir } from "fs/promises";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const saveFile = async (file: File, prefix: string): Promise<string> => {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = file.name?.split(".").pop() || "pdf";
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  await Bun.write(filepath, file);
  return `/envicon2026/api/files/${filename}`;
};

export const storedFileExists = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  const filename = path.basename(url);
  return Bun.file(path.join(UPLOADS_DIR, filename)).exists();
};

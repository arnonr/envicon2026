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

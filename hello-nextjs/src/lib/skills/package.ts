import { createClient } from "@/lib/supabase/server";

const MAX_PACKAGE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ["application/zip", "application/x-zip-compressed"];

export interface UploadResult {
  path: string;
  publicUrl?: string;
  error?: string;
}

export interface PackageMeta {
  name: string;
  version: string;
  entryFile: string;
  fileCount: number;
  totalSize: number;
  files: { name: string; size: number }[];
}

export function validatePackageFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "没有选择文件" };
  }

  if (file.size === 0) {
    return { valid: false, error: "文件为空" };
  }

  if (file.size > MAX_PACKAGE_SIZE) {
    return { valid: false, error: "技能包文件不能超过 50MB" };
  }

  const fileType = file.type;
  if (!ALLOWED_FILE_TYPES.includes(fileType) && !file.name.endsWith(".zip")) {
    return { valid: false, error: "仅支持 .zip 格式的技能包" };
  }

  return { valid: true };
}

export async function uploadSkillPackage(
  skillSlug: string,
  version: string,
  fileBuffer: Buffer
): Promise<UploadResult> {
  const supabase = await createClient();

  const path = `skills/${skillSlug}/${version}/package.zip`;

  const { error } = await supabase.storage
    .from("skill-packages")
    .upload(path, fileBuffer, {
      contentType: "application/zip",
      upsert: true,
    });

  if (error) {
    return { path, error: error.message };
  }

  return { path };
}

export async function uploadSkillAsset(
  skillSlug: string,
  filename: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const supabase = await createClient();

  const path = `skills/${skillSlug}/${filename}`;

  const { error } = await supabase.storage
    .from("skill-assets")
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { path, error: error.message };
  }

  const { data } = supabase.storage.from("skill-assets").getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

export async function getSkillPackageSignedUrl(
  skillSlug: string,
  version: string
): Promise<{ signedUrl?: string; error?: string }> {
  const supabase = await createClient();
  const path = `skills/${skillSlug}/${version}/package.zip`;

  const { data, error } = await supabase.storage
    .from("skill-packages")
    .createSignedUrl(path, 300); // 5 minutes

  if (error) {
    return { error: error.message };
  }

  return { signedUrl: data.signedUrl };
}

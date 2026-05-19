import type {
  SkillManifest,
  ManifestValidationResult,
  ManifestValidationError,
} from "@/types/skill";

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9._]+)?(\+[a-zA-Z0-9._]+)?$/;
const NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$/;

export function validateManifest(raw: unknown): ManifestValidationResult {
  const errors: ManifestValidationError[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: [{ field: "root", message: "manifest 必须是一个 JSON 对象" }] };
  }

  const m = raw as Record<string, unknown>;

  if (!m.name || typeof m.name !== "string") {
    errors.push({ field: "name", message: "必须填写技能名称" });
  } else if (!NAME_REGEX.test(m.name)) {
    errors.push({ field: "name", message: "技能名称格式无效（字母数字下划线，2-64字符）" });
  }

  if (!m.version || typeof m.version !== "string") {
    errors.push({ field: "version", message: "必须填写版本号" });
  } else if (!SEMVER_REGEX.test(m.version)) {
    errors.push({
      field: "version",
      message: "版本号格式无效，需符合语义化版本规范（如 1.0.0）",
    });
  }

  if (!m.description || typeof m.description !== "string") {
    errors.push({ field: "description", message: "必须填写技能描述" });
  } else if (m.description.length < 10) {
    errors.push({ field: "description", message: "技能描述至少需要 10 个字符" });
  }

  if (!m.author || typeof m.author !== "string") {
    errors.push({ field: "author", message: "必须填写作者信息" });
  }

  if (!m.entry || typeof m.entry !== "string") {
    errors.push({ field: "entry", message: "必须指定入口文件" });
  } else if (!m.entry.endsWith(".js") && !m.entry.endsWith(".ts") && !m.entry.endsWith(".py")) {
    errors.push({ field: "entry", message: "入口文件必须是 .js、.ts 或 .py 文件" });
  }

  if (!Array.isArray(m.permissions)) {
    errors.push({ field: "permissions", message: "permissions 必须是一个数组" });
  } else {
    m.permissions.forEach((p, i) => {
      if (!p || typeof p !== "object") {
        errors.push({ field: `permissions[${i}]`, message: "权限项必须是一个对象" });
        return;
      }
      if (!p.name || typeof p.name !== "string") {
        errors.push({ field: `permissions[${i}].name`, message: "权限项必须填写名称" });
      }
      if (!p.description || typeof p.description !== "string") {
        errors.push({ field: `permissions[${i}].description`, message: "权限项必须填写描述" });
      }
    });
  }

  if (!Array.isArray(m.commands)) {
    errors.push({ field: "commands", message: "commands 必须是一个数组" });
  } else if (m.commands.length === 0) {
    errors.push({ field: "commands", message: "至少需要定义一个命令" });
  } else {
    m.commands.forEach((c, i) => {
      if (!c || typeof c !== "object") {
        errors.push({ field: `commands[${i}]`, message: "命令必须是一个对象" });
        return;
      }
      if (!c.name || typeof c.name !== "string") {
        errors.push({ field: `commands[${i}].name`, message: "命令必须填写名称" });
      }
      if (!c.description || typeof c.description !== "string") {
        errors.push({ field: `commands[${i}].description`, message: "命令必须填写描述" });
      }
    });
  }

  if (m.minClientVersion && typeof m.minClientVersion !== "string") {
    errors.push({ field: "minClientVersion", message: "minClientVersion 必须是字符串" });
  } else if (m.minClientVersion && !SEMVER_REGEX.test(m.minClientVersion as string)) {
    errors.push({ field: "minClientVersion", message: "minClientVersion 格式无效" });
  }

  if (m.dependencies && !Array.isArray(m.dependencies)) {
    errors.push({ field: "dependencies", message: "dependencies 必须是字符串数组" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    manifest: m as unknown as SkillManifest,
  };
}

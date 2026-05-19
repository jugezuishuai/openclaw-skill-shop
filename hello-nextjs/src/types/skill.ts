export interface SkillManifestPermission {
  name: string;
  description: string;
  required?: boolean;
}

export interface SkillManifestCommand {
  name: string;
  description: string;
  usage?: string;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  permissions: SkillManifestPermission[];
  commands: SkillManifestCommand[];
  dependencies?: string[];
  minClientVersion?: string;
}

export interface ManifestValidationError {
  field: string;
  message: string;
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: ManifestValidationError[];
  manifest?: SkillManifest;
}

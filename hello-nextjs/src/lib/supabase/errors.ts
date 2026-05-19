export class SupabaseError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "SupabaseError";
    this.status = status;
    this.code = code;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
    };
  }
}

export function handleSupabaseError(error: unknown): SupabaseError {
  if (error instanceof SupabaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new SupabaseError(error.message);
  }

  return new SupabaseError("An unexpected error occurred");
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return error instanceof SupabaseError;
}

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

  // Handle PostgrestError objects (plain objects with code/message/details)
  if (typeof error === "object" && error !== null) {
    const pgError = error as Record<string, unknown>;
    if (pgError.code === "PGRST116") {
      return new SupabaseError("Resource not found", 404, "PGRST116");
    }
    if (typeof pgError.message === "string") {
      return new SupabaseError(pgError.message);
    }
  }

  return new SupabaseError("An unexpected error occurred");
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return error instanceof SupabaseError;
}

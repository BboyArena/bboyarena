export class AppError extends Error {
  readonly code: string;
  readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 500;

  constructor(code: string, status: 400 | 401 | 403 | 404 | 409 | 422 | 500, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

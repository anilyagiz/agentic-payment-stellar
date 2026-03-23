export class StellarAgentError extends Error {
  override name = "StellarAgentError";
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}


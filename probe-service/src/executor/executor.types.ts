export interface HttpResponseData {
  status: number;
  durationMs: number;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface AssertionResult {
  passed: boolean;
  message: string;
  actual?: unknown;
  expected?: unknown;
}


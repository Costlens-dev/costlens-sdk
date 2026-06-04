const DEFAULT_THRESHOLD = 5;
const DEFAULT_TIMEOUT_MS = 60000;

/**
 * Circuit breaker to prevent hammering a failing API.
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailure = 0;
  private threshold: number;
  private timeoutMs: number;

  constructor(threshold = DEFAULT_THRESHOLD, timeoutMs = DEFAULT_TIMEOUT_MS) {
    this.threshold = threshold;
    this.timeoutMs = timeoutMs;
  }

  isOpen(): boolean {
    return (
      this.failureCount >= this.threshold &&
      Date.now() - this.lastFailure < this.timeoutMs
    );
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailure = Date.now();
  }

  reset(): void {
    this.failureCount = 0;
  }
}

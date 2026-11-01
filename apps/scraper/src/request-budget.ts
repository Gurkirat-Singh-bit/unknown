export class RequestBudget {
  private remaining: number

  constructor(limit = 50) {
    this.remaining = limit
  }

  take(): boolean {
    if (this.remaining <= 0) return false
    this.remaining--
    return true
  }
}

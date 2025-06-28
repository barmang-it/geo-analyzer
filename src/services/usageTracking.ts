
export interface UsageStats {
  dailyScans: number;
  dailyCost: number;
  lastReset: string;
  rateLimitHits: number;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

const DAILY_BUDGET_LIMIT = 5.00; // $5 daily limit
const RATE_LIMIT_PER_IP = 10; // 10 scans per hour per IP
const COST_PER_SCAN = 0.0006; // Estimated cost per scan

export class UsageTracker {
  private static instance: UsageTracker;
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getUsageStats(): UsageStats {
    const today = this.getTodayKey();
    const stored = this.storage.getItem(`usage_${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      dailyScans: 0,
      dailyCost: 0,
      lastReset: today,
      rateLimitHits: 0
    };
  }

  private saveUsageStats(stats: UsageStats): void {
    const today = this.getTodayKey();
    this.storage.setItem(`usage_${today}`, JSON.stringify(stats));
  }

  checkRateLimit(ip: string = 'anonymous'): RateLimitInfo {
    const hourKey = `ratelimit_${ip}_${new Date().toISOString().slice(0, 13)}`;
    const count = parseInt(this.storage.getItem(hourKey) || '0');
    
    if (count >= RATE_LIMIT_PER_IP) {
      const stats = this.getUsageStats();
      stats.rateLimitHits++;
      this.saveUsageStats(stats);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (60 * 60 * 1000) // 1 hour
      };
    }
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_PER_IP - count - 1,
      resetTime: Date.now() + (60 * 60 * 1000)
    };
  }

  recordScan(ip: string = 'anonymous'): void {
    // Update rate limit counter
    const hourKey = `ratelimit_${ip}_${new Date().toISOString().slice(0, 13)}`;
    const count = parseInt(this.storage.getItem(hourKey) || '0');
    this.storage.setItem(hourKey, (count + 1).toString());
    
    // Update daily stats
    const stats = this.getUsageStats();
    stats.dailyScans++;
    stats.dailyCost += COST_PER_SCAN;
    this.saveUsageStats(stats);
  }

  checkBudgetLimit(): boolean {
    const stats = this.getUsageStats();
    return stats.dailyCost < DAILY_BUDGET_LIMIT;
  }

  getUsageInfo(): UsageStats & { budgetRemaining: number; withinBudget: boolean } {
    const stats = this.getUsageStats();
    return {
      ...stats,
      budgetRemaining: Math.max(0, DAILY_BUDGET_LIMIT - stats.dailyCost),
      withinBudget: stats.dailyCost < DAILY_BUDGET_LIMIT
    };
  }
}

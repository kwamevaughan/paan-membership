/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics for blog operations
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start timing an operation
   */
  start(label) {
    if (!this.enabled) return;
    
    this.metrics.set(label, {
      startTime: performance.now(),
      label,
    });
  }

  /**
   * End timing and log the result
   */
  end(label, logToConsole = true) {
    if (!this.enabled) return null;

    const metric = this.metrics.get(label);
    if (!metric) {
      console.warn(`⚠️ No start time found for: ${label}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    if (logToConsole) {
      this.logMetric(label, duration);
    }

    return duration;
  }

  /**
   * Log metric with color coding
   */
  logMetric(label, duration) {
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    console.log(`${color} ${label}: ${duration.toFixed(2)}ms`);
  }

  /**
   * Measure an async function
   */
  async measure(label, fn) {
    if (!this.enabled) return await fn();

    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return Array.from(this.metrics.entries()).map(([label, data]) => ({
      label,
      duration: data.duration,
    }));
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const metrics = this.getMetrics().filter(m => m.duration !== undefined);
    
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    return {
      count: metrics.length,
      total: total.toFixed(2),
      average: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      metrics: metrics.sort((a, b) => b.duration - a.duration),
    };
  }

  /**
   * Print summary to console
   */
  printSummary() {
    if (!this.enabled) return;

    const summary = this.getSummary();
    if (!summary) {
      console.log('📊 No performance metrics recorded');
      return;
    }

    console.log('\n📊 Performance Summary:');
    console.log(`   Total operations: ${summary.count}`);
    console.log(`   Total time: ${summary.total}ms`);
    console.log(`   Average: ${summary.average}ms`);
    console.log(`   Fastest: ${summary.min}ms`);
    console.log(`   Slowest: ${summary.max}ms`);
    
    console.log('\n   Top 5 slowest operations:');
    summary.metrics.slice(0, 5).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.label}: ${m.duration.toFixed(2)}ms`);
    });
    console.log('');
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const startTimer = (label) => performanceMonitor.start(label);
export const endTimer = (label, log = true) => performanceMonitor.end(label, log);
export const measureAsync = (label, fn) => performanceMonitor.measure(label, fn);
export const getMetrics = () => performanceMonitor.getMetrics();
export const getSummary = () => performanceMonitor.getSummary();
export const printSummary = () => performanceMonitor.printSummary();
export const clearMetrics = () => performanceMonitor.clear();

export default performanceMonitor;

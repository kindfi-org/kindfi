/**
 * Simulates network delay
 * @param ms Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Simulates error based on probability
   * @param errorRate Probability of error (0-1)
   * @param errorMessage Error message to throw
   * @returns Promise that rejects if error is simulated
   */
  export function simulateError(errorRate: number, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Math.random() < errorRate) {
        reject(new Error(errorMessage));
      } else {
        resolve();
      }
    });
  }
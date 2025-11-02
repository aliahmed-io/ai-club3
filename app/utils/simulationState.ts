export interface SimulationState {
  isRunning: boolean;
  password: string;
  selectedMethod: string;
  speedMultiplier: number;
  attemptNumber: number;
  isComplete: boolean;
}

const STORAGE_KEY = 'brute-force-simulation-state';

export function saveSimulationState(state: SimulationState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadSimulationState(): SimulationState | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse simulation state:', error);
        return null;
      }
    }
  }
  return null;
}

export function clearSimulationState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

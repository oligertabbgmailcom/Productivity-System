import useLocalStorage from './useLocalStorage';

/**
 * Custom React hook for tracking and logging energy levels.
 *
 * @returns {{
 *   energyLogs: Array,
 *   logEnergy: (level: number) => void,
 *   getAverageEnergy: (days?: number) => number|string
 * }} Object with energy logs, log function, and average calculator.
 */
function useEnergy() {
  const [energyLogs, setEnergyLogs] = useLocalStorage('energyLogs', []);

  /**
   * Logs a new energy level entry.
   * @param {number} level - The energy level to log (1-5).
   */
  const logEnergy = (level) => {
    const newLog = {
      id: Date.now(),
      level,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US')
    };
    setEnergyLogs([...energyLogs, newLog]);
    
    // Also update current energy for badges
    try {
      localStorage.setItem('currentEnergy', JSON.stringify(level));
    } catch (error) {
      console.log('Failed to update currentEnergy:', error);
    }
  };

  /**
   * Calculates the average energy level over a number of days.
   * @param {number} [days=7] - Number of days to include in the average.
   * @returns {number|string} The average energy level, or 0 if no logs.
   */
  const getAverageEnergy = (days = 7) => {
    const now = new Date();
    const recentLogs = energyLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
      return diffDays <= days;
    });

    if (recentLogs.length === 0) return 0;
    
    const sum = recentLogs.reduce((acc, log) => acc + log.level, 0);
    return (sum / recentLogs.length).toFixed(1);
  };

  return {
    energyLogs,
    logEnergy,
    getAverageEnergy
  };
}

export default useEnergy;

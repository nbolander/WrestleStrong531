/**
 * This service handles all calculations for the 5/3/1 program
 * including weight calculations, progression, and workout generation.
 */

/**
 * Calculate the training max based on the 1RM
 * @param oneRepMax The one rep maximum weight
 * @returns The training max (90% of 1RM)
 */
export const calculateTrainingMax = (oneRepMax: number): number => {
    return Math.round(oneRepMax * 0.9);
  };
  
  /**
   * Generate the main lift sets for a given week in the 5/3/1 cycle
   * @param trainingMax The current training max
   * @param week The week number (1-4)
   * @returns Array of sets with percentages and weights
   */
   export const generateMainLiftSets = (trainingMax: number, week: 1 | 2 | 3 | 4) => {
        // Percentages for the 5/3/1 program by week
    const weekPercentages = {
      1: [{ reps: 5, percentage: 0.65 }, { reps: 5, percentage: 0.75 }, { reps: '5+', percentage: 0.85 }],
      2: [{ reps: 3, percentage: 0.70 }, { reps: 3, percentage: 0.80 }, { reps: '3+', percentage: 0.90 }],
      3: [{ reps: 5, percentage: 0.75 }, { reps: 3, percentage: 0.85 }, { reps: '1+', percentage: 0.95 }],
      4: [{ reps: 5, percentage: 0.40 }, { reps: 5, percentage: 0.50 }, { reps: 5, percentage: 0.60 }], // Deload
    };
  
    // Default to week 1 if an invalid week is provided
    const percentages = weekPercentages[week] || weekPercentages[1];
    
    // Generate the sets with calculated weights
    return percentages.map((set, index) => ({
      number: index + 1,
      reps: set.reps,
      percentage: set.percentage,
      weight: Math.round(trainingMax * set.percentage / 5) * 5, // Round to nearest 5
      completed: false,
      amrap: set.reps.toString().includes('+'),
    }));
  };
  
  /**
   * Calculate the next cycle's training max
   * @param currentTrainingMax The current training max
   * @param isUpperBody Whether it's an upper body lift (for determining increment)
   * @returns The new training max for the next cycle
   */
  export const calculateNextCycleTrainingMax = (currentTrainingMax: number, isUpperBody: boolean): number => {
    // Upper body lifts increase by 5 pounds, lower body by 10
    const increment = isUpperBody ? 5 : 10;
    return currentTrainingMax + increment;
  };
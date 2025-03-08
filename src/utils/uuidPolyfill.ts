// Simple implementation of a UUID generator for React Native
// This avoids the crypto.getRandomValues() error

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Generate a deterministic ID based on workout properties
export const generateWorkoutId = (
    cycle: number,
    week: number,
    day: number
  ): string => {
    return `workout-${cycle}-${week}-${day}`;
  };

  export const generateExerciseId = (
    workoutId: string,
    exerciseType: string,
    exerciseName: string
  ): string => {
    return `${workoutId}-${exerciseType}-${exerciseName.replace(/\s+/g, '')}`;
  };  
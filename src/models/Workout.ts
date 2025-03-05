export type SetType = 'WARM_UP' | 'MAIN' | 'SUPPLEMENTARY' | 'ASSISTANCE';
export type ExerciseType = 'DEADLIFT' | 'BENCH_PRESS' | 'SQUAT' | 'POWER_CLEAN' | 'ASSISTANCE';

export interface Set {
  number: number;
  reps: number | string; // String for "5+" notation
  weight: number;
  percentage?: number; // For percentage-based sets
  completed: boolean;
  amrap?: boolean;
  actualReps?: number; // For tracking AMRAP sets
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: Set[];
  notes?: string;
}

export interface Workout {
  id: string;
  day: number; // 1, 2, or 3
  name: string;
  date: Date;
  cycle: number;
  week: number;
  completed: boolean;
  mainLift: Exercise;
  supplementaryLift: Exercise;
  assistanceExercises: Exercise[];
}
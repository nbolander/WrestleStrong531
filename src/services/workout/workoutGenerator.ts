import { generateUUID, generateWorkoutId, generateExerciseId } from '../../utils/uuidPolyfill';
import { 
  Workout, 
  Exercise, 
  Set, 
  ExerciseType 
} from '../../models/Workout';
import { User } from '../../models/User';
import { 
  generateMainLiftSets, 
  calculateTrainingMax 
} from './fiveThreeOneCalculator';

/**
 * Workout template structure for the 5/3/1 program
 * Customized for women's wrestling with appropriate assistance work
 */
type WorkoutTemplate = {
  day: number;
  name: string;
  mainLift: {
    type: ExerciseType;
    name: string;
  };
  supplementaryLift: {
    type: ExerciseType;
    name: string;
    repScheme: number[];
    percentageOfTM: number;
  };
  assistanceExercises: {
    type: ExerciseType;
    name: string;
    sets: number;
    reps: number;
    isBodyweight?: boolean;
  }[];
};

// Weekly workout templates for the 5/3/1 program
const workoutTemplates: WorkoutTemplate[] = [
  // Day 1: Squat Focus
  {
    day: 1,
    name: "Squat Day",
    mainLift: {
      type: "SQUAT",
      name: "Back Squat",
    },
    supplementaryLift: {
      type: "SQUAT",
      name: "Front Squat",
      repScheme: [5, 5, 5, 5, 5],
      percentageOfTM: 0.6,
    },
    assistanceExercises: [
      {
        type: "ASSISTANCE",
        name: "Bulgarian Split Squat",
        sets: 3,
        reps: 10,
      },
      {
        type: "ASSISTANCE",
        name: "GHD or Back Extension",
        sets: 3,
        reps: 12,
      },
      {
        type: "ASSISTANCE",
        name: "Ankle Mobility Work",
        sets: 2,
        reps: 10,
        isBodyweight: true,
      },
      {
        type: "ASSISTANCE",
        name: "Core Circuit",
        sets: 3,
        reps: 15,
        isBodyweight: true,
      },
    ],
  },
  
  // Day 2: Bench Press Focus
  {
    day: 2,
    name: "Bench Day",
    mainLift: {
      type: "BENCH_PRESS",
      name: "Bench Press",
    },
    supplementaryLift: {
      type: "BENCH_PRESS",
      name: "Close-Grip Bench Press",
      repScheme: [8, 8, 6, 6, 6],
      percentageOfTM: 0.5,
    },
    assistanceExercises: [
      {
        type: "ASSISTANCE",
        name: "Dumbbell Row",
        sets: 4,
        reps: 10,
      },
      {
        type: "ASSISTANCE",
        name: "Push-up Variations",
        sets: 3,
        reps: 15,
        isBodyweight: true,
      },
      {
        type: "ASSISTANCE",
        name: "Face Pulls",
        sets: 3,
        reps: 15,
      },
      {
        type: "ASSISTANCE",
        name: "Tricep Extension",
        sets: 3,
        reps: 12,
      },
    ],
  },
  
  // Day 3: Deadlift Focus
  {
    day: 3,
    name: "Deadlift Day",
    mainLift: {
      type: "DEADLIFT",
      name: "Deadlift",
    },
    supplementaryLift: {
      type: "DEADLIFT",
      name: "Romanian Deadlift",
      repScheme: [6, 6, 6, 6, 6],
      percentageOfTM: 0.65,
    },
    assistanceExercises: [
      {
        type: "ASSISTANCE",
        name: "Weighted Pull-ups",
        sets: 4,
        reps: 8,
      },
      {
        type: "ASSISTANCE",
        name: "Single-Leg Glute Bridge",
        sets: 3,
        reps: 12,
        isBodyweight: true,
      },
      {
        type: "ASSISTANCE",
        name: "Farmer's Carry",
        sets: 3,
        reps: 1, // 1 rep = 1 carry for appropriate distance
      },
      {
        type: "ASSISTANCE",
        name: "Hollow Body Hold",
        sets: 3,
        reps: 30, // seconds
        isBodyweight: true,
      },
    ],
  },
  
  // Day 4: Power Clean Focus (wrestling-specific)
  {
    day: 4,
    name: "Power Clean Day",
    mainLift: {
      type: "POWER_CLEAN",
      name: "Power Clean",
    },
    supplementaryLift: {
      type: "POWER_CLEAN",
      name: "Hang Clean",
      repScheme: [3, 3, 3, 3, 3],
      percentageOfTM: 0.7,
    },
    assistanceExercises: [
      {
        type: "ASSISTANCE",
        name: "Clean High Pull",
        sets: 4,
        reps: 5,
      },
      {
        type: "ASSISTANCE",
        name: "Kettlebell Swing",
        sets: 3,
        reps: 12,
      },
      {
        type: "ASSISTANCE",
        name: "Wrestling Sprawls",
        sets: 3,
        reps: 10,
        isBodyweight: true,
      },
      {
        type: "ASSISTANCE",
        name: "Medicine Ball Throw",
        sets: 3,
        reps: 8,
      },
    ],
  },
];

/**
 * Generates a set of workouts for a complete cycle (4 weeks) of the 5/3/1 program
 * @param user Current user data with training maxes
 * @returns Array of generated workouts for the cycle
 */
export const generateCycleWorkouts = (user: User): Workout[] => {
  const workouts: Workout[] = [];
  
  // For each of the 4 weeks in a typical 5/3/1 cycle
  for (let week = 1; week <= 4; week++) {
    // For each workout template (typically 4 days per week)
    workoutTemplates.forEach((template) => {
      // Create the workout
      const workout = generateWorkout(
        template,
        user,
        user.currentCycle.number,
        week as 1 | 2 | 3 | 4
      );
      
      workouts.push(workout);
    });
  }
  
  return workouts;
};

/**
 * Generates a single workout based on template, user data, and cycle/week
 * @param template Workout template to use
 * @param user User data with training maxes
 * @param cycle Current cycle number
 * @param week Current week number (1-4)
 * @returns Generated workout with all exercises and sets
 */
export const generateWorkout = (
  template: WorkoutTemplate,
  user: User,
  cycle: number,
  week: 1 | 2 | 3 | 4
): Workout => {
  // Calculate date (for demo purposes, just use current date)
  // Calculate date (for demo purposes, just use current date)
  const workoutDate = new Date();
  
  // Generate deterministic workout ID based on its properties
  const workoutId = generateWorkoutId(cycle, week, template.day);
  
  // Get training max for the main lift
  const getTrainingMax = (liftType: ExerciseType): number => {
    switch (liftType) {
      case "DEADLIFT":
        return user.trainingMaxes.deadlift;
      case "BENCH_PRESS":
        return user.trainingMaxes.benchPress;
      case "SQUAT":
        return user.trainingMaxes.squat;
      case "POWER_CLEAN":
        return user.trainingMaxes.powerClean;
      default:
        return 0;
    }
  };
  
  // Generate main lift
  const mainTrainingMax = getTrainingMax(template.mainLift.type);
  const mainLiftSets = generateMainLiftSets(mainTrainingMax, week);
  
  const mainLift: Exercise = {
    id: generateExerciseId(workoutId, template.mainLift.type, template.mainLift.name),
    name: template.mainLift.name,
    type: template.mainLift.type,
    sets: mainLiftSets,
  };  

  // Generate supplementary lift
  const suppTrainingMax = getTrainingMax(template.supplementaryLift.type);
  const supplementarySets: Set[] = template.supplementaryLift.repScheme.map((reps, index) => {
    const weight = Math.round(suppTrainingMax * template.supplementaryLift.percentageOfTM / 5) * 5;
    
    return {
      number: index + 1,
      reps,
      weight,
      completed: false,
    };
  });
  
  const supplementaryLift: Exercise = {
    id: generateExerciseId(workoutId, template.supplementaryLift.type, template.supplementaryLift.name),
    name: template.supplementaryLift.name,
    type: template.supplementaryLift.type,
    sets: supplementarySets,
  };  

  // Generate assistance exercises
  const assistanceExercises: Exercise[] = template.assistanceExercises.map(
    (exercise) => {
      // For bodyweight exercises, use "BW" instead of weight
      const sets: Set[] = Array(exercise.sets)
        .fill(null)
        .map((_, index) => ({
          number: index + 1,
          reps: exercise.reps,
          weight: exercise.isBodyweight ? 0 : calculateAssistanceWeight(exercise.name, user),
          completed: false,
          isBodyweight: exercise.isBodyweight,
        }));
      
      return {
        id: generateExerciseId(workoutId, "ASSISTANCE", exercise.name),
        name: exercise.name,
        type: "ASSISTANCE",
        sets,
      };
    }
  );
  
  // Create the complete workout
  const workout: Workout = {
    id: workoutId,
    day: template.day,
    name: template.name,
    date: workoutDate,
    cycle,
    week,
    completed: false,
    mainLift,
    supplementaryLift,
    assistanceExercises,
  };

  
  return workout;
};

/**
 * Gets the next workout based on the user's current progress
 * @param user Current user data
 * @param completedWorkoutIds IDs of workouts already completed
 * @returns The next workout to do or null if cycle is complete
 */
export const getNextWorkout = (user: User, completedWorkoutIds: string[]): Workout | null => {
  // Generate all workouts for the current cycle
  const allWorkouts = generateCycleWorkouts(user);
  
  // Find the first workout that hasn't been completed
  const nextWorkout = allWorkouts.find(
    (workout) => 
      workout.cycle === user.currentCycle.number &&
      workout.week === user.currentCycle.week &&
      !completedWorkoutIds.includes(workout.id)
  );
  
  return nextWorkout || null;
};

/**
 * Generate today's workout based on user's training schedule
 * @param user Current user data
 * @param completedWorkoutIds IDs of workouts already completed
 * @returns Today's workout or null if rest day
 */
export const generateTodaysWorkout = (user: User, completedWorkoutIds: string[]): Workout | null => {
  // In a real app, you would determine which workout day it is based on:
  // 1. User's preferred training schedule
  // 2. Day of the week
  // 3. Completed workouts in the current week
  
  // For this example, we'll simply get the next workout in the progression
  return getNextWorkout(user, completedWorkoutIds);
};

/**
 * Calculate appropriate weight for assistance exercises
 * @param exerciseName Name of the assistance exercise
 * @param user User data to base calculations on
 * @returns Calculated weight for the assistance exercise
 */
const calculateAssistanceWeight = (exerciseName: string, user: User): number => {
  // In a production app, you would have more sophisticated logic here
  // based on the exercise type and user's strength levels
  
  // These are simplified examples
  const lowerBodyExercises = [
    "Bulgarian Split Squat",
    "GHD or Back Extension",
    "Single-Leg Glute Bridge",
  ];
  
  const upperBodyExercises = [
    "Dumbbell Row",
    "Face Pulls",
    "Tricep Extension",
    "Weighted Pull-ups",
  ];
  
  const explosiveExercises = [
    "Clean High Pull",
    "Kettlebell Swing",
    "Medicine Ball Throw",
  ];
  
  const carryExercises = ["Farmer's Carry"];
  
  // Base calculations on percentages of main lifts
  if (lowerBodyExercises.includes(exerciseName)) {
    // ~25-30% of squat TM per side (dumbbells/kettlebells)
    return Math.round((user.trainingMaxes.squat * 0.3) / 5) * 5;
  } else if (upperBodyExercises.includes(exerciseName)) {
    // ~20-25% of bench TM per side
    return Math.round((user.trainingMaxes.benchPress * 0.25) / 5) * 5;
  } else if (explosiveExercises.includes(exerciseName)) {
    // ~30-40% of power clean TM
    return Math.round((user.trainingMaxes.powerClean * 0.4) / 5) * 5;
  } else if (carryExercises.includes(exerciseName)) {
    // ~40-50% of deadlift TM per hand
    return Math.round((user.trainingMaxes.deadlift * 0.5) / 5) * 5;
  }
  
  // Default calculation if exercise type is unknown
  return Math.round((user.trainingMaxes.benchPress * 0.2) / 5) * 5;
};
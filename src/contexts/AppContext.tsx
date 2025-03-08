import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../models/User';
import { Workout, Set } from '../models/Workout';
import { loadUserData, saveUserData, loadWorkouts, saveWorkout } from '../services/storage/userStorage';
import { generateMainLiftSets, calculateTrainingMax, calculateNextCycleTrainingMax } from '../services/workout/fiveThreeOneCalculator';
import { generateTodaysWorkout, generateCycleWorkouts } from '../services/workout/workoutGenerator';

// Define the shape of our context
interface AppContextType {
  user: User | null;
  workouts: Workout[];
  currentWorkout: Workout | null;
  loading: boolean;
  // User actions
  updateUser: (userData: Partial<User>) => void;
  setInitialUserData: (userData: User) => void;
  // Workout actions
  completeWorkout: (workout: Workout) => void;
  toggleSetCompletion: (workoutId: string, exerciseId: string, setIndex: number) => void;
  updateAmrapResult: (workoutId: string, exerciseId: string, setIndex: number, reps: number) => void;
  getCurrentWorkout: () => Workout | null;
  generateNewWorkout: () => Workout | null;
  // Training actions
  advanceToNextCycle: () => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data when the app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await loadUserData();
        if (userData) {
          setUser(userData);
        }

        const workoutData = await loadWorkouts();
        if (workoutData) {
          setWorkouts(workoutData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading app data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update user data and save to storage
  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await saveUserData(updatedUser);
    }
  };

  // Set initial user data (for first-time setup)
  const setInitialUserData = async (userData: User) => {
    setUser(userData);
    await saveUserData(userData);
    
    // Generate initial workouts for the first cycle
    if (userData) {
      const generatedWorkouts = generateCycleWorkouts(userData);
      setWorkouts(generatedWorkouts);
      
      // Save the generated workouts
      for (const workout of generatedWorkouts) {
        await saveWorkout(workout);
      }
    }
  };

  // Complete a workout
  const completeWorkout = async (workout: Workout) => {
    const updatedWorkout = { ...workout, completed: true };
    
    // Update the workout in state
    const updatedWorkouts = workouts.map(w => 
      w.id === workout.id ? updatedWorkout : w
    );
    
    setWorkouts(updatedWorkouts);
    
    // If it was the current workout, clear that
    if (currentWorkout && currentWorkout.id === workout.id) {
      setCurrentWorkout(null);
    }
    
    // Save to storage
    await saveWorkout(updatedWorkout);
    
    // Check if we should advance to the next week/cycle
    const completedWorkoutsThisWeek = updatedWorkouts.filter(
      w => w.completed && 
      w.cycle === user?.currentCycle.number && 
      w.week === user?.currentCycle.week
    ).length;
    
    // If all 4 workouts for the week are completed, advance to next week
    if (completedWorkoutsThisWeek >= 4 && user) {
      const isLastWeek = user.currentCycle.week === 4;
      
      if (isLastWeek) {
        // If it's the last week, advance to next cycle
        advanceToNextCycle();
      } else {
        // Just advance to the next week
        updateUser({
          currentCycle: {
            ...user.currentCycle,
            week: (user.currentCycle.week + 1) as 1 | 2 | 3 | 4
          }
        });
      }
    }
  };

  // Toggle the completion status of a set
  const toggleSetCompletion = (workoutId: string, exerciseId: string, setIndex: number) => {
    // Find the workout
    const workoutToUpdate = workouts.find(w => w.id === workoutId);
    if (!workoutToUpdate) return;
    
    // Create a deep copy of the workout
    const updatedWorkout = JSON.parse(JSON.stringify(workoutToUpdate));
    
    // Find the exercise
    let exerciseToUpdate;
    if (updatedWorkout.mainLift.id === exerciseId) {
      exerciseToUpdate = updatedWorkout.mainLift;
    } else if (updatedWorkout.supplementaryLift.id === exerciseId) {
      exerciseToUpdate = updatedWorkout.supplementaryLift;
    } else {
      exerciseToUpdate = updatedWorkout.assistanceExercises.find((e: { id: string; }) => e.id === exerciseId);
    }
    
    if (!exerciseToUpdate) return;
    
    // Toggle the set completion
    exerciseToUpdate.sets[setIndex].completed = !exerciseToUpdate.sets[setIndex].completed;
    
    // Update state and save
    const updatedWorkouts = workouts.map(w => 
      w.id === workoutId ? updatedWorkout : w
    );
    
    setWorkouts(updatedWorkouts);
    
    // If it's the current workout, update that too
    if (currentWorkout && currentWorkout.id === workoutId) {
      setCurrentWorkout(updatedWorkout);
    }
    
    // Save to storage (this would be async in a real app)
    saveWorkout(updatedWorkout);
  };
  
  // Update AMRAP set results
  const updateAmrapResult = (workoutId: string, exerciseId: string, setIndex: number, reps: number) => {
    // Find the workout
    const workoutToUpdate = workouts.find(w => w.id === workoutId);
    if (!workoutToUpdate) return;
    
    // Create a deep copy of the workout
    const updatedWorkout = JSON.parse(JSON.stringify(workoutToUpdate));
    
    // Find the exercise (assume it's the main lift for AMRAP sets)
    let exerciseToUpdate = updatedWorkout.mainLift;
    
    // Update the AMRAP result
    if (exerciseToUpdate.sets[setIndex]) {
      exerciseToUpdate.sets[setIndex].actualReps = reps;
      exerciseToUpdate.sets[setIndex].completed = true;
    }
    
    // Update state and save
    const updatedWorkouts = workouts.map(w => 
      w.id === workoutId ? updatedWorkout : w
    );
    
    setWorkouts(updatedWorkouts);
    
    // If it's the current workout, update that too
    if (currentWorkout && currentWorkout.id === workoutId) {
      setCurrentWorkout(updatedWorkout);
    }
    
    // Save to storage
    saveWorkout(updatedWorkout);
  };

  // Get the current workout for today
  const getCurrentWorkout = () => {
    if (currentWorkout) return currentWorkout;
    
    if (!user) return null;
    
    // Get IDs of completed workouts
    const completedWorkoutIds = workouts
      .filter(w => w.completed)
      .map(w => w.id);
    
    // Get the next workout using the workout generator
    const nextWorkout = generateTodaysWorkout(user, completedWorkoutIds);
    
    if (nextWorkout) {
      // Check if this workout already exists in our state
      const existingWorkout = workouts.find(w => 
        w.cycle === nextWorkout.cycle && 
        w.week === nextWorkout.week && 
        w.day === nextWorkout.day
      );
      
      if (existingWorkout && !existingWorkout.completed) {
        setCurrentWorkout(existingWorkout);
        return existingWorkout;
      }
      
      // If the workout doesn't exist yet, add it
      setCurrentWorkout(nextWorkout);
      setWorkouts([...workouts, nextWorkout]);
      saveWorkout(nextWorkout);
      return nextWorkout;
    }
    
    return null;
  };
  
  // Generate a new workout on demand
  const generateNewWorkout = () => {
    if (!user) return null;
    
    // Get IDs of completed workouts
    const completedWorkoutIds = workouts
      .filter(w => w.completed)
      .map(w => w.id);
    
    // Generate a new workout
    const newWorkout = generateTodaysWorkout(user, completedWorkoutIds);
    
    if (newWorkout) {
      setCurrentWorkout(newWorkout);
      setWorkouts([...workouts, newWorkout]);
      saveWorkout(newWorkout);
      return newWorkout;
    }
    
    return null;
  };

  // Advance to the next training cycle
  const advanceToNextCycle = async () => {
    if (!user) return;
    
    // Determine if we need to increment the week or the cycle
    let updatedWeek = user.currentCycle.week;
    let updatedCycleNumber = user.currentCycle.number;
    
    if (updatedWeek < 4) {
      // Move to the next week in the same cycle
      updatedWeek += 1;
    } else {
      // Move to week 1 of the next cycle
      updatedWeek = 1;
      updatedCycleNumber += 1;
      
      // Update training maxes for the new cycle
      const updatedTrainingMaxes = {
        deadlift: calculateNextCycleTrainingMax(user.trainingMaxes.deadlift, false),
        benchPress: calculateNextCycleTrainingMax(user.trainingMaxes.benchPress, true),
        squat: calculateNextCycleTrainingMax(user.trainingMaxes.squat, false),
        powerClean: calculateNextCycleTrainingMax(user.trainingMaxes.powerClean, true),
      };
      
      // Update user data
      const updatedUser = {
        ...user,
        trainingMaxes: updatedTrainingMaxes,
        currentCycle: {
          number: updatedCycleNumber,
          week: updatedWeek
        }
      };
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
      
      // Generate workouts for the new cycle
      const newCycleWorkouts = generateCycleWorkouts(updatedUser);
      
      // Add the new workouts to state and save them
      setWorkouts([...workouts, ...newCycleWorkouts]);
      
      for (const workout of newCycleWorkouts) {
        await saveWorkout(workout);
      }
      
      return;
    }
    
    // Update user data with just the new week/cycle
    const updatedUser = {
      ...user,
      currentCycle: {
        number: updatedCycleNumber,
        week: updatedWeek
      }
    };
    
    setUser(updatedUser);
    await saveUserData(updatedUser);
  };

  return (
    <AppContext.Provider value={{
      user,
      workouts,
      currentWorkout,
      loading,
      updateUser,
      setInitialUserData,
      completeWorkout,
      toggleSetCompletion,
      updateAmrapResult,
      getCurrentWorkout,
      generateNewWorkout,
      advanceToNextCycle
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
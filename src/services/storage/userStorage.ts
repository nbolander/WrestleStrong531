import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../models/User';
import { Workout } from '../../models/Workout';

// Keys for storage
const USER_DATA_KEY = 'wrestlestrong_user_data';
const WORKOUTS_KEY = 'wrestlestrong_workouts';

// Save user data
export const saveUserData = async (userData: User): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Load user data
export const loadUserData = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// Save a workout
export const saveWorkout = async (workout: Workout): Promise<void> => {
  try {
    // First get existing workouts
    const existingWorkouts = await loadWorkouts();
    
    // Find if this workout already exists (by id)
    const index = existingWorkouts.findIndex(w => w.id === workout.id);
    
    if (index !== -1) {
      // Update existing workout
      existingWorkouts[index] = workout;
    } else {
      // Add new workout
      existingWorkouts.push(workout);
    }
    
    // Save back to storage
    const jsonValue = JSON.stringify(existingWorkouts);
    await AsyncStorage.setItem(WORKOUTS_KEY, jsonValue);
    console.log('Workout saved successfully');
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
};

// Load all workouts
export const loadWorkouts = async (): Promise<Workout[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(WORKOUTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
};

// Clear all data (for testing or reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([USER_DATA_KEY, WORKOUTS_KEY]);
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
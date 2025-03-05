import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Define the parameters for your stack navigator routes
export type RootStackParamList = {
  Setup: undefined;
  Main: undefined;
};

// Define the parameters for your tab navigator routes
export type MainTabParamList = {
  Workout: undefined;
  Progress: undefined;
  Learn: undefined;
  Settings: undefined;
};

// Define navigation prop types for each screen
export type SetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Setup'>;
export type WorkoutScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Workout'>;
export type ProgressScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Progress'>;
export type LearnScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Learn'>;
export type SettingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Settings'>;
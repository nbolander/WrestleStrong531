import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppContext } from '../contexts/AppContext';
import { RootStackParamList, MainTabParamList } from '../types/navigation';

// Import screens
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import LearnScreen from '../screens/LearnScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SetupScreen from '../screens/SetupScreen';

// Import icons
import { Calendar, BarChart2, BookOpen, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Function to create the main tab navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Workout') {
          return <Calendar size={size} color={color} />;
        } else if (route.name === 'Progress') {
          return <BarChart2 size={size} color={color} />;
        } else if (route.name === 'Learn') {
          return <BookOpen size={size} color={color} />;
        } else if (route.name === 'Settings') {
          return <Settings size={size} color={color} />;
        }
      },
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Workout" 
      component={WorkoutScreen} 
      options={{ title: 'Today\'s Workout' }} 
    />
    <Tab.Screen 
      name="Progress" 
      component={ProgressScreen} 
      options={{ title: 'My Progress' }}
    />
    <Tab.Screen 
      name="Learn" 
      component={LearnScreen} 
      options={{ title: 'Learn' }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

// Main app navigation
const AppNavigator = () => {
  const { user, loading } = useAppContext();

  // Show loading screen while checking for user data
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is set up, show the main app
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          // No user data, show the setup screen
          <Stack.Screen name="Setup" component={SetupScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
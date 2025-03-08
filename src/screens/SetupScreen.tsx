import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { calculateTrainingMax } from '../services/workout/fiveThreeOneCalculator';
import { SetupScreenNavigationProp } from '../types/navigation';

type SetupScreenProps = {
    navigation: SetupScreenNavigationProp;
};

const SetupScreen: React.FC<SetupScreenProps> = ({ navigation }) => {
    const { setInitialUserData } = useAppContext();
    
  // Form state
  const [name, setName] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [oneRepMaxes, setOneRepMaxes] = useState({
    deadlift: '',
    benchPress: '',
    squat: '',
    powerClean: ''
  });
  
  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!name || !weightClass) {
      Alert.alert('Missing Information', 'Please fill out all fields');
      return;
    }
    
    // Validate that all 1RM values are numbers
    const deadlift = parseFloat(oneRepMaxes.deadlift);
    const benchPress = parseFloat(oneRepMaxes.benchPress);
    const squat = parseFloat(oneRepMaxes.squat);
    const powerClean = parseFloat(oneRepMaxes.powerClean);
    
    if (isNaN(deadlift) || isNaN(benchPress) || isNaN(squat) || isNaN(powerClean)) {
      Alert.alert('Invalid Values', 'Please enter valid numbers for all lifts');
      return;
    }
    
    const userData = {
      id: Date.now().toString(),
      name,
      weightClass,
      trainingMaxes: {
        deadlift: calculateTrainingMax(deadlift),
        benchPress: calculateTrainingMax(benchPress),
        squat: calculateTrainingMax(squat),
        powerClean: calculateTrainingMax(powerClean)
      },
      currentCycle: {
        number: 1,
        week: 1
      },
      startDate: new Date()
    };
    
    // Save user data
    setInitialUserData(userData);
    
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WrestleStrong 5/3/1</Text>
        <Text style={styles.subtitle}>Initial Setup</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
        
        <Text style={styles.label}>Weight Class</Text>
        <TextInput
          style={styles.input}
          value={weightClass}
          onChangeText={setWeightClass}
          placeholder="e.g., 68kg"
        />
        
        <Text style={styles.sectionTitle}>Your Current One-Rep Maxes (1RM)</Text>
        <Text style={styles.infoText}>
          Enter your current 1RM for each lift. If you don't know your 1RM, you can estimate it by:
          Weight × Reps × 0.0333 + Weight
        </Text>
        
        <Text style={styles.label}>Deadlift (lbs)</Text>
        <TextInput
          style={styles.input}
          value={oneRepMaxes.deadlift}
          onChangeText={(text) => setOneRepMaxes({...oneRepMaxes, deadlift: text})}
          placeholder="Enter your 1RM"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Bench Press (lbs)</Text>
        <TextInput
          style={styles.input}
          value={oneRepMaxes.benchPress}
          onChangeText={(text) => setOneRepMaxes({...oneRepMaxes, benchPress: text})}
          placeholder="Enter your 1RM"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Squat (lbs)</Text>
        <TextInput
          style={styles.input}
          value={oneRepMaxes.squat}
          onChangeText={(text) => setOneRepMaxes({...oneRepMaxes, squat: text})}
          placeholder="Enter your 1RM"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Power Clean (lbs)</Text>
        <TextInput
          style={styles.input}
          value={oneRepMaxes.powerClean}
          onChangeText={(text) => setOneRepMaxes({...oneRepMaxes, powerClean: text})}
          placeholder="Enter your 1RM"
          keyboardType="numeric"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Start My Program</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 8,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetupScreen;
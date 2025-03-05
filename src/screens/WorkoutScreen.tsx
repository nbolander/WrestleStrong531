import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppContext } from '../contexts/AppContext';

const WorkoutScreen = () => {
  const { 
    user, 
    currentWorkout, 
    loading, 
    getCurrentWorkout,
    toggleSetCompletion,
    completeWorkout
  } = useAppContext();
  
  useEffect(() => {
    // Get the current workout when the screen loads
    if (!currentWorkout) {
      getCurrentWorkout();
    }
  }, []);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading workout data...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please set up your user profile first.</Text>
      </View>
    );
  }
  
  if (!currentWorkout) {
    return (
      <View style={styles.container}>
        <Text>No workout found for today. Create a new workout plan.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{user.name} • {user.weightClass}</Text>
        <Text style={styles.cycleText}>
          Cycle {user.currentCycle.number}, Week {user.currentCycle.week}
        </Text>
      </View>

      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{currentWorkout.name}</Text>
          <Text style={styles.workoutDate}>
            {new Date(currentWorkout.date).toLocaleDateString()}
          </Text>
        </View>
        
        {/* Main Lift Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Lift: {currentWorkout.mainLift.name}</Text>
          <Text style={styles.sectionSubtitle}>
            {user.currentCycle.week === 1 ? '5/5/5+' : 
             user.currentCycle.week === 2 ? '3/3/3+' : 
             user.currentCycle.week === 3 ? '5/3/1+' : 'Deload'}
          </Text>
          
          {currentWorkout.mainLift.sets.map((set, index) => (
            <TouchableOpacity 
              key={`main-${index}`} 
              style={styles.setRow}
              onPress={() => toggleSetCompletion(currentWorkout.id, currentWorkout.mainLift.id, index)}
            >
              <View style={styles.setInfo}>
                <Text style={styles.setText}>Set {set.number}: </Text>
                <Text>{set.reps} reps @ {set.weight} lbs</Text>
                {typeof set.reps === 'string' && set.reps.includes('+') && (
                  <Text style={styles.amrapText}> (AMRAP)</Text>
                )}
              </View>
              <View style={[
                styles.checkBox, 
                set.completed ? styles.completed : null
              ]} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Supplementary Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplementary: {currentWorkout.supplementaryLift.name}</Text>
          
          <View style={styles.setGrid}>
            {currentWorkout.supplementaryLift.sets.map((set, index) => (
              <TouchableOpacity
                key={`supp-${index}`}
                style={styles.gridItem}
                onPress={() => toggleSetCompletion(currentWorkout.id, currentWorkout.supplementaryLift.id, index)}
              >
                <Text>{set.reps} reps</Text>
                <Text style={styles.weightText}>{set.weight} lbs</Text>
                <View style={[
                  styles.checkBox, 
                  set.completed ? styles.completed : null,
                  {marginTop: 5}
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Assistance Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistance Work</Text>
          
          {currentWorkout.assistanceExercises.map((exercise, exerciseIndex) => (
            <View key={`assist-${exerciseIndex}`} style={styles.assistanceExercise}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              
              <View style={styles.setGrid}>
                {exercise.sets.map((set, setIndex) => (
                  <TouchableOpacity
                    key={`assist-${exerciseIndex}-${setIndex}`}
                    style={styles.gridItem}
                    onPress={() => toggleSetCompletion(currentWorkout.id, exercise.id, setIndex)}
                  >
                    <Text>{set.reps}</Text>
                    <Text style={styles.weightText}>{set.weight}</Text>
                    <View style={[
                      styles.checkBox, 
                      set.completed ? styles.completed : null,
                      {marginTop: 5}
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={() => completeWorkout(currentWorkout)}
        >
          <Text style={styles.completeButtonText}>Complete Workout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recoveryCard}>
        <Text style={styles.recoveryTitle}>Recovery Protocols</Text>
        <View style={styles.recoveryItem}>
          <View style={styles.bullet} />
          <Text>10 min foam rolling (focus on hamstrings & upper back)</Text>
        </View>
        <View style={styles.recoveryItem}>
          <View style={styles.bullet} />
          <Text>15 min hip mobility routine</Text>
        </View>
        <View style={styles.recoveryItem}>
          <View style={styles.bullet} />
          <Text>Protein intake: 25-30g within 30 min post-workout</Text>
        </View>
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
    backgroundColor: '#1e3a8a', // Dark blue
    padding: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
  },
  cycleText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDate: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setText: {
    fontWeight: '500',
  },
  amrapText: {
    color: '#2563eb', // Blue
    fontSize: 14,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  completed: {
    backgroundColor: '#10b981', // Green
    borderColor: '#10b981',
  },
  setGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gridItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 8,
    alignItems: 'center',
    width: '18%',
  },
  weightText: {
    fontSize: 12,
    color: '#666',
  },
  assistanceExercise: {
    marginTop: 16,
  },
  exerciseName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  completeButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recoveryCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
});

export default WorkoutScreen;
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { Clock, X, ChevronUp, ChevronDown, Check, Edit2 } from 'lucide-react-native';
import { Set } from '../models/Workout'; // Add this import

// AMRAP Input Modal Component
const AmrapInputModal = ({ 
  visible, 
  onClose, 
  onSave, 
  set,
}: { 
  visible: boolean, 
  onClose: () => void, 
  onSave: (reps: number) => void,
  set: (Set & { exerciseId: string }) | null
}) => {
  const [reps, setReps] = useState(set?.actualReps?.toString() || '');
  
  const handleSave = () => {
    const repsNumber = parseInt(reps);
    if (isNaN(repsNumber) || repsNumber < 1) {
      Alert.alert('Invalid Input', 'Please enter a valid number of reps');
      return;
    }
    
    onSave(repsNumber);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AMRAP Set</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalLabel}>
                How many reps did you complete?
              </Text>
              
              <View style={styles.amrapInputRow}>
                <Text style={styles.amrapSetInfo}>
                  {set ? `${set.weight} lbs ×` : ''}
                </Text>
                <TextInput
                  style={styles.amrapInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  maxLength={2}
                  autoFocus={true}
                />
                <Text style={styles.amrapSetInfo}>reps</Text>
              </View>
              
              <View style={styles.estimatedRow}>
                <Text style={styles.estimatedLabel}>
                  Estimated 1RM: 
                </Text>
                <Text style={styles.estimatedValue}>
                  {reps && !isNaN(parseInt(reps)) && parseInt(reps) > 0 && set
                    ? Math.round(set.weight * (1 + parseInt(reps) / 30))
                    : '--'} lbs
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const WeightAdjustmentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  exercise: { name: string; isBodyweight?: boolean } | null;
  currentWeight: number;
}> = ({
  visible,
  onClose,
  onSave,
  exercise,
  currentWeight
}) => {
  const [weight, setWeight] = useState(currentWeight.toString());
  
  const handleSave = () => {
    const weightNumber = parseInt(weight);
    if (isNaN(weightNumber) || weightNumber < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight');
      return;
    }
    
    onSave(weightNumber);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adjust Weight</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalLabel}>
                {exercise?.name || 'Exercise'}
              </Text>
              
              <View style={styles.weightInputRow}>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus={true}
                />
                <Text style={styles.weightUnit}>lbs</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Weight</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Main WorkoutScreen Component
const WorkoutScreen = () => {
  const { 
    user, 
    currentWorkout, 
    loading, 
    getCurrentWorkout,
    toggleSetCompletion,
    updateAmrapResult,
    completeWorkout,
    generateNewWorkout,
    updateExerciseWeight
  } = useAppContext();
  
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showAmrapModal, setShowAmrapModal] = useState(false);
  const [selectedAmrapSet, setSelectedAmrapSet] = useState<(Set & { exerciseId: string }) | null>(null);
  
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedExerciseForWeight, setSelectedExerciseForWeight] = useState<{
    name: string;
    id: string;
    setIndex: number;
    weight: number;
    isBodyweight?: boolean;
  } | null>(null);

  useEffect(() => {
    // Get the current workout when the screen loads
    if (!currentWorkout) {
      getCurrentWorkout();
    }
  }, []);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyMessage}>Please set up your user profile first.</Text>
      </View>
    );
  }
  
  if (!currentWorkout) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyWorkoutContainer}>
          <Text style={styles.emptyMessage}>No workout found for today.</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => generateNewWorkout()}
          >
            <Text style={styles.generateButtonText}>Generate Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Handler for AMRAP set taps
  const handleAmrapSetPress = (set: Set, exerciseId: string) => {
    setSelectedAmrapSet({ ...set, exerciseId });
    setShowAmrapModal(true);
  };
  
  // Save AMRAP result
  const saveAmrapResult = (reps: number) => {
    if (selectedAmrapSet) {
      const setIndex = selectedAmrapSet.number - 1;
      updateAmrapResult(
        currentWorkout.id, 
        selectedAmrapSet.exerciseId, 
        setIndex, 
        reps
      );
    }
  };
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!currentWorkout) return 0;
    
    let totalSets = 0;
    let completedSets = 0;
    
    // Count main lift sets
    totalSets += currentWorkout.mainLift.sets.length;
    completedSets += currentWorkout.mainLift.sets.filter(s => s.completed).length;
    
    // Count supplementary sets
    totalSets += currentWorkout.supplementaryLift.sets.length;
    completedSets += currentWorkout.supplementaryLift.sets.filter(s => s.completed).length;
    
    // Count assistance sets
    currentWorkout.assistanceExercises.forEach(exercise => {
      totalSets += exercise.sets.length;
      completedSets += exercise.sets.filter(s => s.completed).length;
    });
    
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };
  // Handler for weight adjustment button clicks
  const handleWeightAdjustment = (exerciseId: string, setIndex: number, name: string, weight: number, isBodyweight?: boolean) => {
    if (isBodyweight) {
      Alert.alert('Bodyweight Exercise', 'This is a bodyweight exercise and does not use external weight.');
      return;
    }
    
    setSelectedExerciseForWeight({
      id: exerciseId,
      setIndex,
      name,
      weight,
      isBodyweight
    });
    setShowWeightModal(true);
  };  
  // Handler for saving the adjusted weight
  const saveAdjustedWeight = (weight: number) => {
    if (!selectedExerciseForWeight || !currentWorkout) return;
    
    // Call the context function to update the weight
    updateExerciseWeight(
      currentWorkout.id,
      selectedExerciseForWeight.id,
      selectedExerciseForWeight.setIndex,
      weight
    );
  };
  // Handle workout completion
  const handleCompleteWorkout = () => {
    // Check if any AMRAP sets haven't been recorded
    const amrapSets = currentWorkout.mainLift.sets.filter(set => set.amrap);
    const unrecordedAmraps = amrapSets.filter(set => !set.actualReps && set.completed);
    
    if (unrecordedAmraps.length > 0) {
      Alert.alert(
        'Missing AMRAP Results',
        'You marked AMRAP sets as complete but didn\'t record your reps. Add your AMRAP results for better progress tracking?',
        [
          { text: 'Complete Anyway', onPress: () => completeWorkout(currentWorkout) },
          { text: 'Add Results', style: 'cancel' }
        ]
      );
      return;
    }
    
    completeWorkout(currentWorkout);
  };

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
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${calculateCompletionPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {calculateCompletionPercentage()}% Complete
          </Text>
        </View>
        
        {/* Main Lift Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Lift: {currentWorkout.mainLift.name}</Text>
          <Text style={styles.sectionSubtitle}>
            {user.currentCycle.week === 1 ? '5/5/5+' : 
             user.currentCycle.week === 2 ? '3/3/3+' : 
             user.currentCycle.week === 3 ? '5/3/1+' : 'Deload 5/5/5'}
          </Text>
          
          {currentWorkout.mainLift.sets.map((set, index) => (
            <TouchableOpacity 
              key={`main-${index}`} 
              style={styles.setRow}
              onPress={() => {
                if (set.amrap) {
                  handleAmrapSetPress(set, currentWorkout.mainLift.id);
                } else {
                  toggleSetCompletion(currentWorkout.id, currentWorkout.mainLift.id, index);
                }
              }}
            >
              <View style={styles.setInfo}>
                <Text style={styles.setText}>Set {set.number}: </Text>
                <Text>{typeof set.reps === 'string' ? set.reps : `${set.reps} reps`} @ {set.weight} lbs</Text>
                {set.amrap && (
                  <Text style={styles.amrapText}> (AMRAP)</Text>
                )}
                {set.actualReps && (
                  <Text style={styles.amrapResult}> → {set.actualReps} reps</Text>
                )}
              </View>
              <View style={[
                styles.checkBox, 
                set.completed ? styles.completed : null
              ]}>
                {set.completed && (
                  <Check size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.timerToggle}
            onPress={() => setShowRestTimer(!showRestTimer)}
          >
            <Clock size={16} color="#2563eb" />
            <Text style={styles.timerToggleText}>
              {showRestTimer ? 'Hide Rest Timer' : 'Show Rest Timer'}
            </Text>
          </TouchableOpacity>
          
          {showRestTimer && (
            <RestTimer onComplete={() => {}} />
          )}
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
                <View style={styles.weightContainer}>
                  <Text style={styles.weightText}>{set.weight} lbs</Text>
                  <TouchableOpacity 
                    style={styles.editWeightButton}
                    onPress={() => handleWeightAdjustment(
                      currentWorkout.supplementaryLift.id, 
                      index, 
                      currentWorkout.supplementaryLift.name, 
                      set.weight
                    )}
                  >
                    <Edit2 size={12} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={[
                  styles.checkBox, 
                  set.completed ? styles.completed : null,
                  {marginTop: 5}
                ]}>
                  {set.completed && (
                    <Check size={12} color="#fff" />
                  )}
                </View>
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
                    <Text>{set.reps} {typeof set.reps === 'number' ? 'reps' : ''}</Text>
                    <View style={styles.weightContainer}>
                      <Text style={styles.weightText}>
                        {set.isBodyweight ? 'BW' : `${set.weight} lbs`}
                      </Text>
                      {!set.isBodyweight && (
                        <TouchableOpacity 
                          style={styles.editWeightButton}
                          onPress={() => handleWeightAdjustment(
                            exercise.id, 
                            setIndex, 
                            exercise.name, 
                            set.weight,
                            set.isBodyweight
                          )}
                        >
                          <Edit2 size={12} color="#666" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={[
                      styles.checkBox, 
                      set.completed ? styles.completed : null,
                      {marginTop: 5}
                    ]}>
                      {set.completed && (
                        <Check size={12} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleCompleteWorkout}
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
      
      {/* AMRAP Input Modal */}
      <AmrapInputModal
        visible={showAmrapModal}
        onClose={() => setShowAmrapModal(false)}
        onSave={saveAmrapResult}
        set={selectedAmrapSet}
      />
      {/* Add the Weight Adjustment Modal */}
      <WeightAdjustmentModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSave={saveAdjustedWeight}
        exercise={selectedExerciseForWeight ? { name: selectedExerciseForWeight.name, isBodyweight: selectedExerciseForWeight.isBodyweight } : null}
        currentWeight={selectedExerciseForWeight?.weight || 0}
      />
    </ScrollView>
  );
};

// Timer component for rest periods
const RestTimer = ({ onComplete }: { onComplete: () => void }) => {
  const [seconds, setSeconds] = useState(90); // Default 90 seconds rest
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState('90');
  const [showCustom, setShowCustom] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      if (interval) clearInterval(interval);
      onComplete();
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onComplete]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = (time: number = 90) => {
    setIsActive(false);
    setSeconds(time);
  };
  
  const setCustomTimer = () => {
    const time = parseInt(customTime);
    if (!isNaN(time) && time > 0) {
      resetTimer(time);
      setShowCustom(false);
    }
  };
  
  // Format seconds as MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerTitle}>Rest Timer</Text>
      
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>
      
      <View style={styles.timerControls}>
        <TouchableOpacity 
          style={[styles.timerButton, isActive ? styles.timerButtonActive : null]} 
          onPress={toggleTimer}
        >
          <Text style={styles.timerButtonText}>{isActive ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timerButton} 
          onPress={() => resetTimer()}
        >
          <Text style={styles.timerButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.timerButton} 
          onPress={() => setShowCustom(true)}
        >
          <Text style={styles.timerButtonText}>Custom</Text>
        </TouchableOpacity>
      </View>
      
      {showCustom && (
        <View style={styles.customTimeContainer}>
          <TextInput
            style={styles.customTimeInput}
            value={customTime}
            onChangeText={setCustomTime}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.customTimeLabel}>seconds</Text>
          <TouchableOpacity 
            style={styles.customTimeButton}
            onPress={setCustomTimer}
          >
            <Text style={styles.customTimeButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2563eb',
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
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
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
    flexWrap: 'wrap',
  },
  setText: {
    fontWeight: '500',
  },
  amrapText: {
    color: '#2563eb', // Blue
    fontSize: 14,
  },
  amrapResult: {
    color: '#10b981', // Green
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completed: {
    backgroundColor: '#10b981', // Green
    borderColor: '#10b981',
  },
  timerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  timerToggleText: {
    color: '#2563eb',
    marginLeft: 6,
    fontSize: 14,
  },
  timerContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#2563eb',
  },
  timerButtonText: {
    fontWeight: '500',
    color: '#1f2937',
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customTimeInput: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    width: 60,
    textAlign: 'center',
  },
  customTimeLabel: {
    marginHorizontal: 8,
  },
  customTimeButton: {
    backgroundColor: '#e5e7eb',
    padding: 6,
    borderRadius: 4,
  },
  customTimeButtonText: {
    fontSize: 14,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  closeButton: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  amrapInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amrapSetInfo: {
    fontSize: 16,
  },
  amrapInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginHorizontal: 8,
    width: 60,
    textAlign: 'center',
  },
  estimatedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  estimatedLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  estimatedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Weight adjustment styles
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editWeightButton: {
    marginLeft: 4,
    padding: 2,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  weightInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    width: 80,
    textAlign: 'center',
  },
  weightUnit: {
    fontSize: 16,
    marginLeft: 8,
  }
});

export default WorkoutScreen;
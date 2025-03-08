import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../models/User';
import { 
  Settings, 
  UserCircle, 
  Dumbbell, 
  Bell, 
  Info, 
  LogOut, 
  X, 
  ChevronRight,
  CheckCircle
} from 'lucide-react-native';
import { calculateTrainingMax } from '../services/workout/fiveThreeOneCalculator';

type SettingSection = 'PROFILE' | 'TRAINING' | 'NOTIFICATIONS' | 'ABOUT';

const SettingsScreen = () => {
  const { user, loading, updateUser, clearAllData } = useAppContext();
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditTrainingMaxModal, setShowEditTrainingMaxModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editWeightClass, setEditWeightClass] = useState(user?.weightClass || '');
  
  // Training max edit state
  const [editOneRepMaxes, setEditOneRepMaxes] = useState({
    deadlift: user?.trainingMaxes.deadlift ? Math.round(user.trainingMaxes.deadlift / 0.9).toString() : '',
    benchPress: user?.trainingMaxes.benchPress ? Math.round(user.trainingMaxes.benchPress / 0.9).toString() : '',
    squat: user?.trainingMaxes.squat ? Math.round(user.trainingMaxes.squat / 0.9).toString() : '',
    powerClean: user?.trainingMaxes.powerClean ? Math.round(user.trainingMaxes.powerClean / 0.9).toString() : ''
  });
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [restTimerSound, setRestTimerSound] = useState(true);
  
  // Loading state for buttons
  const [saving, setSaving] = useState(false);
  
  // Handle profile update
  const handleUpdateProfile = () => {
    if (!editName || !editWeightClass) {
      Alert.alert('Missing Information', 'Please fill out all fields');
      return;
    }
    
    setSaving(true);
    
    try {
      // Update user profile
      updateUser({
        name: editName,
        weightClass: editWeightClass
      });
      
      setSaving(false);
      setShowEditProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: unknown) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    }
  };
  
  // Handle training maxes update
  const handleUpdateTrainingMaxes = () => {
    // Validate that all 1RM values are numbers
    const deadlift = parseFloat(editOneRepMaxes.deadlift);
    const benchPress = parseFloat(editOneRepMaxes.benchPress);
    const squat = parseFloat(editOneRepMaxes.squat);
    const powerClean = parseFloat(editOneRepMaxes.powerClean);
    
    if (isNaN(deadlift) || isNaN(benchPress) || isNaN(squat) || isNaN(powerClean)) {
      Alert.alert('Invalid Values', 'Please enter valid numbers for all lifts');
      return;
    }
    
    setSaving(true);
    
    // Calculate new training maxes
    const updatedTrainingMaxes = {
      deadlift: calculateTrainingMax(deadlift),
      benchPress: calculateTrainingMax(benchPress),
      squat: calculateTrainingMax(squat),
      powerClean: calculateTrainingMax(powerClean)
    };
    
    try {
      // Update user training maxes
      updateUser({
        trainingMaxes: updatedTrainingMaxes
      });
      
      setSaving(false);
      setShowEditTrainingMaxModal(false);
      Alert.alert('Success', 'Training maxes updated successfully');
    } catch (error: unknown) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update training maxes');
      console.error(error);
    }
  };
  
  // Handle reset app data
  const handleResetAppData = () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to reset all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setSaving(true);
            clearAllData().then(() => {
              setSaving(false);
              Alert.alert('Success', 'App data has been reset');
            }).catch(error => {
              setSaving(false);
              Alert.alert('Error', 'Failed to reset app data');
              console.error(error);
            });
          }
        }
      ]
    );
  };
  
  // Settings sections
  type SettingItem = {
    icon: React.ReactNode;
    title: string;
    action: () => void;
    rightElement?: React.ReactNode;
  };
  
  const settingsSections: Record<SettingSection, { title: string; items: SettingItem[] }> = {
    PROFILE: {
      title: 'Profile',
      items: [
        {
          icon: <UserCircle size={20} color="#2563eb" />,
          title: 'Edit Profile',
          action: () => setShowEditProfileModal(true),
          rightElement: <ChevronRight size={18} color="#9ca3af" />
        }
      ]
    },
    TRAINING: {
      title: 'Training',
      items: [
        {
          icon: <Dumbbell size={20} color="#2563eb" />,
          title: 'Update Training Maxes',
          action: () => setShowEditTrainingMaxModal(true),
          rightElement: <ChevronRight size={18} color="#9ca3af" />
        }
      ]
    },
    NOTIFICATIONS: {
      title: 'Notifications',
      items: [
        {
          icon: <Bell size={20} color="#2563eb" />,
          title: 'Enable Notifications',
          action: () => setNotificationsEnabled(!notificationsEnabled),
          rightElement: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={notificationsEnabled ? '#2563eb' : '#f4f4f5'}
            />
          )
        },
        {
          icon: <Bell size={20} color="#2563eb" />,
          title: 'Workout Reminders',
          action: () => setWorkoutReminders(!workoutReminders),
          rightElement: (
            <Switch
              value={workoutReminders}
              onValueChange={setWorkoutReminders}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={workoutReminders ? '#2563eb' : '#f4f4f5'}
              disabled={!notificationsEnabled}
            />
          )
        },
        {
          icon: <Bell size={20} color="#2563eb" />,
          title: 'Rest Timer Sound',
          action: () => setRestTimerSound(!restTimerSound),
          rightElement: (
            <Switch
              value={restTimerSound}
              onValueChange={setRestTimerSound}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={restTimerSound ? '#2563eb' : '#f4f4f5'}
            />
          )
        }
      ]
    },
    ABOUT: {
      title: 'About',
      items: [
        {
          icon: <Info size={20} color="#2563eb" />,
          title: 'About WrestleStrong 5/3/1',
          action: () => setShowAboutModal(true),
          rightElement: <ChevronRight size={18} color="#9ca3af" />
        },
        {
          icon: <LogOut size={20} color="#ef4444" />,
          title: 'Reset App Data',
          action: handleResetAppData
        }
      ]
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading settings...</Text>
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{user.name} • {user.weightClass}</Text>
        <Text style={styles.cycleText}>
          Cycle {user.currentCycle.number}, Week {user.currentCycle.week}
        </Text>
      </View>
      
      <View style={styles.profileSummary}>
        <View style={styles.profileIconContainer}>
          <UserCircle size={40} color="#2563eb" />
        </View>
        <View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileDetail}>Weight Class: {user.weightClass}</Text>
          <Text style={styles.profileDetail}>
            Training since: {new Date(user.startDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {/* Settings Sections */}
      {(Object.keys(settingsSections) as SettingSection[]).map((sectionKey) => {
        const section = settingsSections[sectionKey];
        return (
          <View key={sectionKey} style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.settingItem,
                    index === section.items.length - 1 ? styles.settingItemLast : null
                  ]}
                  onPress={item.action}
                >
                  <View style={styles.settingLeft}>
                    {item.icon}
                    <Text style={[
                      styles.settingText,
                      item.title === 'Reset App Data' ? styles.settingTextDanger : null
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  {item.rightElement}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
      
      <Text style={styles.appVersion}>WrestleStrong 5/3/1 • Version 1.0.0</Text>
      
      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEditProfileModal(false)}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
            />
            
            <Text style={styles.inputLabel}>Weight Class</Text>
            <TextInput
              style={styles.input}
              value={editWeightClass}
              onChangeText={setEditWeightClass}
              placeholder="e.g., 68kg"
            />
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Edit Training Maxes Modal */}
      <Modal
        visible={showEditTrainingMaxModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditTrainingMaxModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update 1RM Values</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEditTrainingMaxModal(false)}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Enter your current 1RM for each lift. Training maxes will be calculated at 90%.
            </Text>
            
            <Text style={styles.inputLabel}>Deadlift (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editOneRepMaxes.deadlift}
              onChangeText={(text) => setEditOneRepMaxes({...editOneRepMaxes, deadlift: text})}
              placeholder="Enter your 1RM"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Bench Press (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editOneRepMaxes.benchPress}
              onChangeText={(text) => setEditOneRepMaxes({...editOneRepMaxes, benchPress: text})}
              placeholder="Enter your 1RM"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Squat (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editOneRepMaxes.squat}
              onChangeText={(text) => setEditOneRepMaxes({...editOneRepMaxes, squat: text})}
              placeholder="Enter your 1RM"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Power Clean (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editOneRepMaxes.powerClean}
              onChangeText={(text) => setEditOneRepMaxes({...editOneRepMaxes, powerClean: text})}
              placeholder="Enter your 1RM"
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleUpdateTrainingMaxes}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Update Maxes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About WrestleStrong 5/3/1</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAboutModal(false)}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.aboutContent}>
              <Text style={styles.aboutHeader}>What is the 5/3/1 Program?</Text>
              <Text style={styles.aboutText}>
                The 5/3/1 program is a strength training system designed by Jim Wendler. It focuses on simple progression through four main lifts: Squat, Bench Press, Deadlift, and in this wrestling-specific adaptation, Power Clean.
              </Text>
              
              <Text style={styles.aboutHeader}>Program Structure</Text>
              <Text style={styles.aboutText}>
                • 4-week cycles with specific rep schemes{"\n"}
                • Week 1: 5/5/5+ (five reps across with AMRAP on last set){"\n"}
                • Week 2: 3/3/3+ (three reps across with AMRAP on last set){"\n"}
                • Week 3: 5/3/1+ (five, three, then one rep with AMRAP on last set){"\n"}
                • Week 4: 5/5/5 lighter weights (deload week)
              </Text>
              
              <Text style={styles.aboutHeader}>Wrestling-Specific Adaptations</Text>
              <Text style={styles.aboutText}>
                WrestleStrong 5/3/1 modifies the traditional program to better support female wrestlers by:{"\n"}
                • Incorporating Power Clean as a main lift{"\n"}
                • Adding wrestling-specific assistance work{"\n"}
                • Focusing on explosive strength and conditioning{"\n"}
                • Considering weight class maintenance
              </Text>
              
              <Text style={styles.aboutHeader}>App Features</Text>
              <Text style={styles.aboutText}>
                • Automatic progression tracking{"\n"}
                • 1RM estimation based on AMRAP sets{"\n"}
                • Workout generation with appropriate weights{"\n"}
                • Progress visualization and statistics{"\n"}
                • Customizable training parameters
              </Text>
              
              <View style={styles.aboutCredits}>
                <Text style={styles.creditsText}>
                  Created for women wrestlers everywhere
                </Text>
                <Text style={styles.creditsText}>
                  © 2025 WrestleStrong App
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
    marginHorizontal: 24,
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
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1f2937',
  },
  settingTextDanger: {
    color: '#ef4444',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
    padding: 20,
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
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutContent: {
    maxHeight: 400,
  },
  aboutHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 16,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  aboutCredits: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  closeModalButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingsScreen;
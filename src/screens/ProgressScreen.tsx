import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { LineChart } from 'react-native-chart-kit';
import { Workout } from '../models/Workout';

// Tab type definition
type ProgressTab = 'OVERVIEW' | 'LIFTS' | 'HISTORY';

const ProgressScreen = () => {
  const { user, workouts, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState<ProgressTab>('OVERVIEW');
  const [selectedLift, setSelectedLift] = useState<string>('SQUAT');

  // Filter completed workouts
  const completedWorkouts = workouts.filter(workout => workout.completed);

  // Calculate summary statistics
  const getTotalWorkouts = () => completedWorkouts.length;
  const getTotalVolume = () => {
    let totalVolume = 0;
    completedWorkouts.forEach(workout => {
      // Add main lift volume
      workout.mainLift.sets.forEach(set => {
        if (set.completed) {
          const reps = typeof set.reps === 'string' 
            ? (set.actualReps || parseInt(set.reps)) 
            : set.reps;
          totalVolume += set.weight * (typeof reps === 'number' ? reps : 0);
        }
      });

      // Add supplementary volume
      workout.supplementaryLift.sets.forEach(set => {
        if (set.completed) {
          const reps = typeof set.reps === 'string' 
            ? parseInt(set.reps) 
            : set.reps;
          totalVolume += set.weight * reps;
        }
      });

      // Add assistance volume (non-bodyweight only)
      workout.assistanceExercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && !set.isBodyweight) {
            const reps = typeof set.reps === 'string' 
              ? parseInt(set.reps) 
              : set.reps;
            totalVolume += set.weight * reps;
          }
        });
      });
    });
    return totalVolume;
  };

  const getCurrentCycle = () => user?.currentCycle.number || 0;
  const getCurrentWeek = () => user?.currentCycle.week || 0;

  // Get AMRAP data for a specific lift type
  const getAmrapData = (liftType: string) => {
    const amrapSets = completedWorkouts
      .filter(workout => workout.mainLift.type === liftType)
      .map(workout => {
        const amrapSet = workout.mainLift.sets.find(set => set.amrap && set.actualReps);
        if (amrapSet) {
          return {
            date: new Date(workout.date),
            weight: amrapSet.weight,
            reps: amrapSet.actualReps || 0,
            estimated1RM: Math.round(amrapSet.weight * (1 + (amrapSet.actualReps || 0) / 30)),
            cycle: workout.cycle,
            week: workout.week
          };
        }
        return null;
      })
      .filter(data => data !== null) as {
        date: Date;
        weight: number;
        reps: number;
        estimated1RM: number;
        cycle: number;
        week: number;
      }[];

    // Sort by date
    return amrapSets.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Get recent AMRAP data for all main lifts
  const getRecentAmrapData = () => {
    const liftTypes = ['SQUAT', 'BENCH_PRESS', 'DEADLIFT', 'POWER_CLEAN'];
    const recentData: {[key: string]: any} = {};

    liftTypes.forEach(type => {
      const amrapData = getAmrapData(type);
      if (amrapData.length > 0) {
        const mostRecent = amrapData[amrapData.length - 1];
        recentData[type] = mostRecent;
      }
    });

    return recentData;
  };

  // Get chart data for the selected lift
  const getChartData = () => {
    const amrapData = getAmrapData(selectedLift);
    
    if (amrapData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [0],
            color: () => '#2563eb',
          }
        ]
      };
    }

    return {
      labels: amrapData.map(data => `C${data.cycle}W${data.week}`),
      datasets: [
        {
          data: amrapData.map(data => data.estimated1RM),
          color: () => '#2563eb',
        }
      ]
    };
  };

  // Get the display name for a lift type
  const getLiftDisplayName = (liftType: string) => {
    switch (liftType) {
      case 'SQUAT':
        return 'Squat';
      case 'BENCH_PRESS':
        return 'Bench Press';
      case 'DEADLIFT':
        return 'Deadlift';
      case 'POWER_CLEAN':
        return 'Power Clean';
      default:
        return liftType;
    }
  };

  // Group workouts by week
  const getWorkoutsByWeek = () => {
    const grouped: { [key: string]: Workout[] } = {};
    
    completedWorkouts.forEach(workout => {
      const key = `Cycle ${workout.cycle}, Week ${workout.week}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workout);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading progress data...</Text>
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

  if (completedWorkouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyMessage}>
          No workout data available yet. Complete your first workout to see progress tracking.
        </Text>
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'OVERVIEW' && styles.activeTab]}
          onPress={() => setActiveTab('OVERVIEW')}
        >
          <Text style={[styles.tabText, activeTab === 'OVERVIEW' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'LIFTS' && styles.activeTab]}
          onPress={() => setActiveTab('LIFTS')}
        >
          <Text style={[styles.tabText, activeTab === 'LIFTS' && styles.activeTabText]}>
            Lifts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'HISTORY' && styles.activeTab]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overview Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <View style={styles.tabContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{getTotalWorkouts()}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {getTotalVolume().toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Volume (lbs)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{getCurrentCycle()}</Text>
              <Text style={styles.statLabel}>Cycle</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{getCurrentWeek()}</Text>
              <Text style={styles.statLabel}>Week</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent AMRAP Sets</Text>
          
          <View style={styles.recentAmrapContainer}>
            {Object.entries(getRecentAmrapData()).map(([liftType, data]) => (
              <View key={liftType} style={styles.amrapCard}>
                <Text style={styles.amrapTitle}>{getLiftDisplayName(liftType)}</Text>
                <View style={styles.amrapDetails}>
                  <Text style={styles.amrapWeight}>{data.weight} lbs</Text>
                  <Text style={styles.amrapReps}>× {data.reps} reps</Text>
                </View>
                <Text style={styles.estimatedRM}>Est. 1RM: {data.estimated1RM} lbs</Text>
                <Text style={styles.amrapDate}>
                  Cycle {data.cycle}, Week {data.week}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Training Maxes</Text>
          
          <View style={styles.tmCard}>
            <View style={styles.tmRow}>
              <Text style={styles.tmLabel}>Squat</Text>
              <Text style={styles.tmValue}>{user.trainingMaxes.squat} lbs</Text>
            </View>
            <View style={styles.tmRow}>
              <Text style={styles.tmLabel}>Bench Press</Text>
              <Text style={styles.tmValue}>{user.trainingMaxes.benchPress} lbs</Text>
            </View>
            <View style={styles.tmRow}>
              <Text style={styles.tmLabel}>Deadlift</Text>
              <Text style={styles.tmValue}>{user.trainingMaxes.deadlift} lbs</Text>
            </View>
            <View style={styles.tmRow}>
              <Text style={styles.tmLabel}>Power Clean</Text>
              <Text style={styles.tmValue}>{user.trainingMaxes.powerClean} lbs</Text>
            </View>
          </View>
        </View>
      )}

      {/* Lifts Tab Content */}
      {activeTab === 'LIFTS' && (
        <View style={styles.tabContent}>
          <View style={styles.liftTypeSelector}>
            <TouchableOpacity 
              style={[styles.liftTypeButton, selectedLift === 'SQUAT' && styles.activeLiftType]}
              onPress={() => setSelectedLift('SQUAT')}
            >
              <Text style={[styles.liftTypeText, selectedLift === 'SQUAT' && styles.activeLiftTypeText]}>
                Squat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.liftTypeButton, selectedLift === 'BENCH_PRESS' && styles.activeLiftType]}
              onPress={() => setSelectedLift('BENCH_PRESS')}
            >
              <Text style={[styles.liftTypeText, selectedLift === 'BENCH_PRESS' && styles.activeLiftTypeText]}>
                Bench
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.liftTypeButton, selectedLift === 'DEADLIFT' && styles.activeLiftType]}
              onPress={() => setSelectedLift('DEADLIFT')}
            >
              <Text style={[styles.liftTypeText, selectedLift === 'DEADLIFT' && styles.activeLiftTypeText]}>
                Deadlift
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.liftTypeButton, selectedLift === 'POWER_CLEAN' && styles.activeLiftType]}
              onPress={() => setSelectedLift('POWER_CLEAN')}
            >
              <Text style={[styles.liftTypeText, selectedLift === 'POWER_CLEAN' && styles.activeLiftTypeText]}>
                P.Clean
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.chartTitle}>
            Estimated 1RM Progression: {getLiftDisplayName(selectedLift)}
          </Text>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData()}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#2563eb',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <Text style={styles.sectionTitle}>AMRAP Set Results</Text>
          
          <View style={styles.amrapTable}>
            <View style={styles.amrapTableHeader}>
              <Text style={styles.amrapTableCell}>Cycle/Week</Text>
              <Text style={styles.amrapTableCell}>Weight</Text>
              <Text style={styles.amrapTableCell}>Reps</Text>
              <Text style={styles.amrapTableCell}>Est. 1RM</Text>
            </View>
            {getAmrapData(selectedLift).map((data, index) => (
              <View key={index} style={styles.amrapTableRow}>
                <Text style={styles.amrapTableCell}>C{data.cycle}W{data.week}</Text>
                <Text style={styles.amrapTableCell}>{data.weight}</Text>
                <Text style={styles.amrapTableCell}>{data.reps}</Text>
                <Text style={styles.amrapTableCell}>{data.estimated1RM}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* History Tab Content */}
      {activeTab === 'HISTORY' && (
        <View style={styles.tabContent}>
          {Object.entries(getWorkoutsByWeek()).map(([weekLabel, weekWorkouts]) => (
            <View key={weekLabel} style={styles.historySection}>
              <Text style={styles.historySectionTitle}>{weekLabel}</Text>
              
              {weekWorkouts.map((workout, index) => (
                <View key={index} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.historyWorkoutName}>{workout.name}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(workout.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.historyDetail}>
                    <Text style={styles.historyLiftName}>
                      {workout.mainLift.name}
                    </Text>
                    <Text style={styles.historySetInfo}>
                      {workout.mainLift.sets.map(set => {
                        if (set.amrap && set.actualReps) {
                          return `${set.weight}×${set.actualReps}`;
                        }
                        return null;
                      }).filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
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
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
    marginHorizontal: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e0e7ff',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  tabContent: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
    color: '#1f2937',
  },
  recentAmrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amrapCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amrapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  amrapDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  amrapWeight: {
    fontSize: 16,
    fontWeight: '500',
  },
  amrapReps: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  estimatedRM: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 4,
  },
  amrapDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tmCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tmLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  tmValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  liftTypeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  liftTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeLiftType: {
    backgroundColor: '#2563eb',
  },
  liftTypeText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 13,
  },
  activeLiftTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  amrapTable: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amrapTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  amrapTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  amrapTableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  historySection: {
    marginBottom: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyWorkoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  historyDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLiftName: {
    fontSize: 14,
    color: '#1f2937',
  },
  historySetInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
});

export default ProgressScreen;
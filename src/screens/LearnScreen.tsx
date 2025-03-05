import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LearnScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learning </Text>
      <Text>Learning details will appear here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default LearnScreen;

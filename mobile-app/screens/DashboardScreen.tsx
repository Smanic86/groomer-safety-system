/**
 * @file DashboardScreen.tsx
 * @description Main dashboard screen for salon owners, including team and staff management.
 * @copyright Copyright (c) 2026 Shaun Hancock. All rights reserved.
 */

import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import StaffManager from '../components/StaffManager';

export default function DashboardScreen({ profile }: { profile: any }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>
        Welcome back, {profile?.business_name || 'Salon Owner'}!
      </Text>
      
      {/* Your other dashboard widgets, metrics, and cards can go here */}

      {/* Staff Management Panel */}
      {profile?.id && (
        <StaffManager ownerId={profile.id} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  welcome: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#0f172a'
  }
});
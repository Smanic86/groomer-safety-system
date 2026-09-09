/**
 * Copyright (c) 2026 Groomer Safety System. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ReportButton() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ReportProblem')}>
      <Text style={styles.fabText}>⚠️ Report Bug</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#dd6b20',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});
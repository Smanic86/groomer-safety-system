import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Groomer Safety System - Offline Warning Banner
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected !== false) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ Offline Mode: Changes will sync when reconnected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#9c4221',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
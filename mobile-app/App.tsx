/**
 * Copyright (c) 2026. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './screens/DashboardScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import AddPetScreen from './screens/AddPetScreen';
import StaffScreen from './screens/AddStaffScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DashboardScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="PetDetailScreen" component={PetDetailScreen} />
        <Stack.Screen name="AddPetScreen" component={AddPetScreen} />
        <Stack.Screen name="StaffScreen" component={StaffScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
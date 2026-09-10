import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import LogIncidentScreen from './screens/LogIncidentScreen';
import ReportBugScreen from './screens/ReportProblemScreen';

/**
 * Groomer Safety Management System - Root Navigator
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
        <Stack.Screen name="LogIncident" component={LogIncidentScreen} />
        <Stack.Screen name="ReportBug" component={ReportBugScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
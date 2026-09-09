import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScheduleScreen from './screens/ScheduleScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import LogIncidentScreen from './screens/LogIncidentScreen';
import ReportBugScreen from './screens/ReportProblemScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Schedule"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
        <Stack.Screen name="LogIncident" component={LogIncidentScreen} />
        <Stack.Screen name="ReportBug" component={ReportBugScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
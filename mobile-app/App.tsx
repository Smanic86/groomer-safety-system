import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import StaffMembersScreen from './screens/StaffMembersScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import DogProfilesScreen from './screens/DogProfilesScreen';
import CancellationScreen from './screens/CancellationScreen';

const Stack = createNativeStackNavigator();
const CURRENT_VERSION = "1.0.6";

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StaffMembers" component={StaffMembersScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="DogProfiles" component={DogProfilesScreen} />
        <Stack.Screen name="Cancellation" component={CancellationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
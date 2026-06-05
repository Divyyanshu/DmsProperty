import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Screens
import SplashScreen from '../Screens/SplashScreen';
import DmsLoginScreen from '../Screens/DmsLoginScreen';
import DashboardScreen from '../Screens/DmsDashboard/DashboardScreen';
import NewEnquiryScreen from '../Screens/DmsDashboard/NewEnquiryScreen';
import ReportsScreen from '../Screens/DmsDashboard/ReportsScreen';
import EnquiryRecords from '../Screens/DmsDashboard/Modals/EnquiryRecords';
import SubscriptionRecords from '../Screens/DmsDashboard/Modals/SubscriptionRecords';
import ExpensesScreen from '../Screens/DmsDashboard/ExpensesScreen';
import NewBookingScreen from '../Screens/DmsDashboard/NewBookingScreen';
import TotalExpensesScreen from '../Screens/DmsDashboard/TotalExpensesScreen';
import TotalRevnueScreen from '../Screens/DmsDashboard/TotalRevnueScreen';
import TotalEnquiryScreen from '../Screens/DmsDashboard/TotalEnquiryScreen';
import CheckinDetailsScreen from '../Screens/DmsDashboard/CheckinDetailsScreen';





const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {/* Splash */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Login */}
        <Stack.Screen
          name="DmsLoginScreen"
          component={DmsLoginScreen}
        />

        {/* Dashboard */}
        <Stack.Screen
          name="DashboardScreen"
          component={DashboardScreen}
        />

        {/* New Enquiry */}
        <Stack.Screen
          name="NewEnquiryScreen"
          component={NewEnquiryScreen}
        />

        {/* Reports */}
        <Stack.Screen
          name="ReportsScreen"
          component={ReportsScreen}
        />


        <Stack.Screen
          name="EnquiryRecords"
          component={EnquiryRecords}
        />


        <Stack.Screen
          name="SubscriptionRecords"
          component={SubscriptionRecords}
        />

      
        <Stack.Screen
          name="ExpensesScreen"
          component={ExpensesScreen }
        />

           <Stack.Screen
          name="NewBookingScreen"
          component={NewBookingScreen}
        />

          <Stack.Screen
          name="TotalExpensesScreen"
          component={TotalExpensesScreen }
        />
          
          <Stack.Screen
           name="TotalRevnueScreen"
           component={TotalRevnueScreen}
          />

            <Stack.Screen
           name="TotalEnquiryScreen"
           component={TotalEnquiryScreen}
          />

            <Stack.Screen
           name="CheckinDetailsScreen"
           component={CheckinDetailsScreen}
          />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
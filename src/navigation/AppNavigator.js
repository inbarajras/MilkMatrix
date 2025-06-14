import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HeaderLogo from '../components/HeaderLogo';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecordMilkScreen from '../screens/RecordMilkScreen';
import RecordHealthScreen from '../screens/RecordHealthScreen';
import MilkRecordsScreen from '../screens/MilkRecordsScreen';
import HealthRecordsScreen from '../screens/HealthRecordsScreen';
import QRScanScreen from '../screens/QRScanScreen';
import EditMilkScreen from '../screens/EditMilkScreen';
import EditHealthScreen from '../screens/EditHealthScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RecordMilk') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'RecordHealth') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'MilkRecords') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'HealthRecords') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4FC3F7',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4FC3F7',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderLogo />,
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="RecordMilk" 
        component={RecordMilkScreen}
        options={{
          title: 'Record Milk',
        }}
      />
      <Tab.Screen 
        name="RecordHealth" 
        component={RecordHealthScreen}
        options={{
          title: 'Health Event',
        }}
      />
      <Tab.Screen 
        name="MilkRecords" 
        component={MilkRecordsScreen}
        options={{
          title: 'Milk Records',
        }}
      />
      <Tab.Screen 
        name="HealthRecords" 
        component={HealthRecordsScreen}
        options={{
          title: 'Health Records',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4FC3F7',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="QRScan" 
        component={QRScanScreen}
        options={{ 
          headerTitle: () => <HeaderLogo showTitle={false} />,
          title: 'QR Scanner',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditMilk" 
        component={EditMilkScreen}
        options={{ 
          title: 'Edit Milk Record',
        }}
      />
      <Stack.Screen 
        name="EditHealth" 
        component={EditHealthScreen}
        options={{ 
          title: 'Edit Health Record',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

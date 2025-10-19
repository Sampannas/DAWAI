import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import LearnScreen from '../screens/LearnScreen';

const Tab = createBottomTabNavigator();

// Centralized Theme for the Navigator
const THEME = {
  background: '#0a0e27',
  primary: '#00d4ff',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  cardBackground: '#1e2742',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the default header
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Create') iconName = 'plus-square';
          else if (route.name === 'Learn') iconName = 'book-open';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: THEME.cardBackground,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
    </Tab.Navigator>
  );
}
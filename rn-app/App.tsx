import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import VodListScreen from './src/screens/VodListScreen';
import VodDetailsScreen from './src/screens/VodDetailsScreen';
import SeriesListScreen from './src/screens/SeriesListScreen';
import SeriesDetailsScreen from './src/screens/SeriesDetailsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { xtreamService } from './src/services/xtreamService';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const isLogged = await xtreamService.isLoggedIn();
    setLoggedIn(isLogged);
    setInitializing(false);
  };

  if (initializing) {
    return (
      <View style={styles.initializing}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000' },
        }}
        initialRouteName={loggedIn ? 'Dashboard' : 'Login'}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Movies" component={VodListScreen} />
        <Stack.Screen name="VodDetails" component={VodDetailsScreen} />
        <Stack.Screen name="Series" component={SeriesListScreen} />
        <Stack.Screen name="SeriesDetails" component={SeriesDetailsScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  initializing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

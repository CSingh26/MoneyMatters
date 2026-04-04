import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './src/ThemeContext';
import AuthScreen from './src/screens/AuthScreen';
import HubScreen from './src/screens/HubScreen';
import TrackerScreen from './src/screens/TrackerScreen';
import PolicyScreen from './src/screens/PolicyScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Hub">
              {(props) => <HubScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Tracker">
              {(props) => <TrackerScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Policy">
              {(props) => <PolicyScreen {...props} user={user} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

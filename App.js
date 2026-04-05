import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { checkHealth } from './src/api/client';
import AuthScreen from './src/screens/AuthScreen';
import HubScreen from './src/screens/HubScreen';
import TrackerScreen from './src/screens/TrackerScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AUTH_API = process.env.EXPO_PUBLIC_AUTH_API || 'http://localhost:3001';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [backendReady, setBackendReady] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    (async () => {
      const ok = await checkHealth(AUTH_API);
      setBackendReady(ok);
    })();
  }, []);

  if (loading || backendReady === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        {backendReady === null && <Text style={styles.hint}>Connecting to server...</Text>}
      </View>
    );
  }

  if (!backendReady) {
    return (
      <View style={styles.center}>
        <Text style={styles.offlineTitle}>Server Unavailable</Text>
        <Text style={styles.offlineMsg}>Could not reach the backend. Please ensure the services are running.</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={async () => {
            setBackendReady(null);
            const ok = await checkHealth(AUTH_API);
            setBackendReady(ok);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Hub">
              {(props) => <HubScreen {...props} user={user} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen name="Tracker">
              {(props) => <TrackerScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Policy">
              {(props) => <PolicyScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} user={user} />}
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  hint: { marginTop: 12, fontSize: 14, color: '#888' },
  offlineTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  offlineMsg: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#FF4081', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});

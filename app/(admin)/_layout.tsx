import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Admin Dashboard',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
    </Stack>
  );
}

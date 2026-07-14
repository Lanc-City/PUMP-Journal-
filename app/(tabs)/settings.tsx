
import { Card, List, useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card} onPress={() => router.push('/appearance')} elevation={2}>
        <List.Item
          title="App Configuration"
          description="Customize the look and feel of the app"
          left={() => <List.Icon icon="palette" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </Card>
      <Card style={styles.card} onPress={() => router.push('/routines')} elevation={2}>
        <List.Item
          title="Manage Routines"
          description="Create and manage your routines"
          left={() => <List.Icon icon="clipboard-list-outline" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </Card>
      <Card style={styles.card} onPress={() => router.push('/manage-exercises')} elevation={2}>
        <List.Item
          title="Manage Exercises"
          description="Create and manage your exercises"
          left={() => <List.Icon icon="dumbbell" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 28,
    marginTop: 16,
  },
});

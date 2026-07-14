
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  FAB,
  List,
  IconButton,
  Portal,
  Dialog,
  Button,
  Chip,
} from 'react-native-paper';
import { StyleSheet, FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { routineStore } from '@/data/routine-store';
import { useRoutines } from '@/hooks/use-routines';
import { useState } from 'react';

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, activeRoutine } = useRoutines();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  const showDialog = (id: string) => {
    setRoutineToDelete(id);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setRoutineToDelete(null);
  };

  const handleDeleteRoutine = () => {
    if (routineToDelete) {
      routineStore.deleteRoutine(routineToDelete);
    }
    hideDialog();
  };

  const handleCreateRoutine = () => {
    const newRoutineId = routineStore.createRoutine('New Routine');
    router.push(`/create-routine?id=${newRoutineId}`);
  };

  return (
    <ThemedView
      style={{
        flex: 1,
      }}
    >
      <ThemedText type="title">Routines</ThemedText>
      <FlatList
        data={routines}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Last updated: ${new Date(
              item.updatedAt
            ).toLocaleDateString()}`}
            onPress={() => router.push(`/view-routine?id=${item.id}`)}
            right={(props) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {activeRoutine?.id === item.id ? (
                  <Chip icon="check" selected>
                    Active
                  </Chip>
                ) : (
                  <IconButton
                    {...props}
                    icon="play"
                    onPress={() => routineStore.setActiveRoutine(item.id)}
                  />
                )}
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => showDialog(item.id)}
                />
              </View>
            )}
          />
        )}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        label="Create Routine"
        style={styles.fab}
        onPress={handleCreateRoutine}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Delete Routine</Dialog.Title>
          <Dialog.Content>
            <ThemedText>
              Are you sure you want to delete this routine?
            </ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleDeleteRoutine}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

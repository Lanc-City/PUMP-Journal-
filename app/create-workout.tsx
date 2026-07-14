
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput, FAB, List, Button } from 'react-native-paper';
import { StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { workoutBuilderStore, Exercise } from '@/data/workout-store';
import { routineStore } from '@/data/routine-store';

export default function CreateWorkoutScreen() {
  const [workoutName, setWorkoutName] = useState("Day 1");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const router = useRouter();
  const { routineId } = useLocalSearchParams();

  useEffect(() => {
    const unsubscribe = workoutBuilderStore.subscribe(() => {
      setExercises([...workoutBuilderStore.getExercises()]);
    });

    // Set initial exercises
    setExercises([...workoutBuilderStore.getExercises()]);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveWorkout = () => {
    if (routineId) {
      const numericRoutineId = Array.isArray(routineId) ? routineId[0] : routineId;
      routineStore.addWorkoutToRoutine(numericRoutineId, workoutName);
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        label="Workout Name"
        value={workoutName}
        onChangeText={setWorkoutName}
        style={styles.input}
      />
      <FlatList
        data={exercises}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Sets: ${item.sets.length}, Reps: ${item.sets[0]?.reps}`}
            onPress={() => router.push({ pathname: '/add-exercise', params: { exercise: JSON.stringify(item) } })}
          />
        )}
        keyExtractor={(item, index) => item.name + index}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-exercise')}
      />
      <Button
        mode="contained"
        onPress={handleSaveWorkout}
        style={styles.saveButton}
      >
        Save Workout
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  saveButton: {
    position: 'absolute',
    margin: 16,
    left: 0,
    right: 0,
    bottom: 80, 
  },
});

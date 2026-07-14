
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { ThemedView } from '@/components/themed-view';
import { routineStore, Routine, Workout } from '@/data/routine-store';
import { Appbar, Button, FAB, List, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/themed-text';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { workoutBuilderStore } from '@/data/workout-store';
import { useFocusEffect } from '@react-navigation/native';

export default function CreateRoutineScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [routine, setRoutine] = useState<Routine | null>(null);

    // This effect keeps the screen's state in sync with the data store.
    // It's necessary so you can see your changes to the routine's name or workouts in real-time.
    useFocusEffect(
        useCallback(() => {
            if (typeof id !== 'string') return;

            const updateRoutineState = () => {
                const foundRoutine = routineStore.getRoutine(id as string);
                setRoutine(foundRoutine ? { ...foundRoutine } : null);
            };

            const unsubscribe = routineStore.subscribe(updateRoutineState);
            updateRoutineState(); // Initial sync

            return () => unsubscribe();
        }, [id])
    );

    const handleWorkoutPress = (workout: Workout) => {
        workoutBuilderStore.loadWorkout(workout);
        router.push('/create-workout');
    };

    const handleAddWorkout = () => {
        router.push(`/create-workout?routineId=${id}`);
    };

    const handleSave = () => {
        if (!routine) return;
        
        // Validate the routine before saving
        const isSaveable = routine.name.trim().length > 0 &&
            routine.workouts.length > 0 &&
            routine.workouts.every(workout => workout.exercises.length > 0);

        if (isSaveable) {
            routineStore.saveData();
            router.back();
        } else {
            Alert.alert(
                "Incomplete Routine",
                "A routine must have a name, at least one workout, and every workout must have at least one exercise."
            );
        }
    };

    const handleCancel = () => {
        if (routine) {
            routineStore.deleteRoutine(routine.id);
            router.back();
        }
    };
    
    return (
        <ThemedView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: 'Create Routine',
                    headerLeft: () => <Appbar.Action icon="close" onPress={handleCancel} />,
                    headerRight: () => (
                        <Button onPress={handleSave}>Save</Button>
                    ),
                }}
            />
            {routine && (
                <>
                    <TextInput
                        label="Routine Name"
                        value={routine.name}
                        onChangeText={(text) => routineStore.updateRoutineName(routine.id, text)}
                    />
                    <ThemedText>Workouts</ThemedText>
                    <FlatList
                        data={routine.workouts}
                        renderItem={({ item }) => (
                            <List.Item
                                title={item.name}
                                onPress={() => handleWorkoutPress(item)}
                            />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </>
            )}
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={handleAddWorkout}
            />
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

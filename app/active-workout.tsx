
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoutines } from '@/hooks/use-routines';
import {
  Card,
  IconButton,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
  Surface,
  FAB,
  Menu,
  List,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { routineStore } from '@/data/routine-store';
import { useSettings } from '@/hooks/use-settings';
import { exercises as exerciseLibrary } from '@/data/exercises';

const KG_TO_LB = 2.20462;

export default function ActiveWorkoutScreen() {
  const { workoutName } = useLocalSearchParams();
  const { activeRoutine } = useRoutines();
  const theme = useAppTheme();
  const router = useRouter();
  const { weightUnit } = useSettings();

  const workout = useMemo(
    () => activeRoutine?.workouts.find((w) => w.name === workoutName),
    [activeRoutine, workoutName]
  );

  const allExercises = useMemo(() => exerciseLibrary.map(e => e.name), []);

  const [workoutState, setWorkoutState] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [notesDialog, setNotesDialog] = useState<{visible: boolean, exerciseIndex: number | null, notes: string}>({ visible: false, exerciseIndex: null, notes: '' });
  const [swapDialog, setSwapDialog] = useState<{visible: boolean, exerciseIndex: number | null}>({ visible: false, exerciseIndex: null });
  const [editSetsDialog, setEditSetsDialog] = useState<{visible: boolean, exerciseIndex: number | null}>({ visible: false, exerciseIndex: null });
  const [summaryDialogVisible, setSummaryDialogVisible] = useState(false);
  const [editingSet, setEditingSet] = useState<{ exerciseIndex: number; setIndex: number } | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState<{[key: number]: boolean}>({});
  const [tempSets, setTempSets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const openMenu = (index: number) => setMenuVisible(prev => ({...prev, [index]: true}));
  const closeMenu = (index: number) => setMenuVisible(prev => ({...prev, [index]: false}));

  const [tempReps, setTempReps] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (workout) {
      const initialState = workout.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          weight: set.weight || 0,
          completed: false,
        })),
      }));
      setWorkoutState({ ...workout, exercises: initialState });
      setTimer(0);
      setIsTimerActive(false);
    }
  }, [workout]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive]);

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutState((prevState: any) => {
      const newExercises = [...prevState.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const newSets = [...exercise.sets];
      newSets[setIndex] = {
        ...newSets[setIndex],
        completed: !newSets[setIndex].completed,
      };
      exercise.sets = newSets;
      newExercises[exerciseIndex] = exercise;
      const updatedState = { ...prevState, exercises: newExercises };

      const allSets = updatedState.exercises.flatMap((e: any) => e.sets);
      const completedCount = allSets.filter((s: any) => s.completed).length;

      if (completedCount > 0 && completedCount < allSets.length) {
        if (!isTimerActive) {
          setIsTimerActive(true);
        }
      } else {
        setIsTimerActive(false);
      }

      return updatedState;
    });
  };

  const showDialog = (exerciseIndex: number, setIndex: number) => {
    const set = workoutState.exercises[exerciseIndex].sets[setIndex];
    setEditingSet({ exerciseIndex, setIndex });
    setTempReps(set.reps.toString());
    const currentWeight = set.weight || 0;
    const displayWeight = weightUnit === 'lb' ? (currentWeight * KG_TO_LB).toFixed(1) : currentWeight.toString();
    setTempWeight(displayWeight);
    setDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);

  const showNotesDialog = (exerciseIndex: number) => {
    const exercise = workoutState.exercises[exerciseIndex];
    setNotesDialog({ 
        visible: true, 
        exerciseIndex, 
        notes: exercise.notes || '' 
    });
  };

  const hideNotesDialog = () => {
      setNotesDialog({ visible: false, exerciseIndex: null, notes: '' });
  };

  const handleSaveNotes = () => {
      if (notesDialog.exerciseIndex !== null) {
          setWorkoutState((prevState: any) => {
              const newExercises = [...prevState.exercises];
              newExercises[notesDialog.exerciseIndex!].notes = notesDialog.notes;
              return { ...prevState, exercises: newExercises };
          });
      }
      hideNotesDialog();
  };

  const showSwapDialog = (exerciseIndex: number) => {
    setSwapDialog({ visible: true, exerciseIndex });
  };

  const hideSwapDialog = () => {
    setSwapDialog({ visible: false, exerciseIndex: null });
    setSearchQuery('');
  };

  const handleSwapExercise = (newExerciseName: string) => {
    if (swapDialog.exerciseIndex !== null) {
      setWorkoutState((prevState: any) => {
        const newExercises = [...prevState.exercises];
        newExercises[swapDialog.exerciseIndex!].name = newExerciseName;
        return { ...prevState, exercises: newExercises };
      });
    }
    hideSwapDialog();
  };

  const showEditSetsDialog = (exerciseIndex: number) => {
    setTempSets(JSON.parse(JSON.stringify(workoutState.exercises[exerciseIndex].sets)));
    setEditSetsDialog({ visible: true, exerciseIndex });
  };

  const hideEditSetsDialog = () => {
    setEditSetsDialog({ visible: false, exerciseIndex: null });
    setTempSets([]);
  };

  const handleSaveSets = () => {
    if (editSetsDialog.exerciseIndex !== null) {
      setWorkoutState((prevState: any) => {
        const newExercises = [...prevState.exercises];
        newExercises[editSetsDialog.exerciseIndex!].sets = tempSets;
        return { ...prevState, exercises: newExercises };
      });
    }
    hideEditSetsDialog();
  };

  const handleTempSetChange = (index: number, field: 'reps' | 'weight', value: string) => {
    const newSets = [...tempSets];
    const setToUpdate = { ...newSets[index] };

    if (field === 'weight') {
      const enteredWeight = parseFloat(value) || 0;
      setToUpdate.weight = weightUnit === 'lb' ? enteredWeight / KG_TO_LB : enteredWeight;
    } else {
      setToUpdate.reps = parseInt(value, 10) || 0;
    }
    newSets[index] = setToUpdate;
    setTempSets(newSets);
  };

  const handleAddSet = () => {
    const newSet = { reps: 8, weight: 0, completed: false };
    if (tempSets.length > 0) {
      const lastSet = tempSets[tempSets.length - 1];
      newSet.reps = lastSet.reps;
      newSet.weight = lastSet.weight;
    }
    setTempSets([...tempSets, newSet]);
  };

  const handleDeleteSet = (index: number) => {
    const newSets = [...tempSets];
    newSets.splice(index, 1);
    setTempSets(newSets);
  };

  const handleSaveSet = () => {
    if (editingSet) {
      const { exerciseIndex, setIndex } = editingSet;
      setWorkoutState((prevState: any) => {
        const newExercises = [...prevState.exercises];
        const exercise = { ...newExercises[exerciseIndex] };
        const newSets = [...exercise.sets];
        
        const enteredWeight = parseFloat(tempWeight) || 0;
        const weightInKg = weightUnit === 'lb' ? enteredWeight / KG_TO_LB : enteredWeight;

        newSets[setIndex] = {
          ...newSets[setIndex],
          reps: parseInt(tempReps, 10) || 0,
          weight: weightInKg,
        };
        exercise.sets = newSets;
        newExercises[exerciseIndex] = exercise;
        return { ...prevState, exercises: newExercises };
      });
      hideDialog();
    }
  };
  
  const handleFinishWorkout = () => {
    routineStore.addWorkoutToHistory(workoutState, timer);
    setSummaryDialogVisible(true);
  };

  const handleCloseSummary = () => {
    setSummaryDialogVisible(false);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!workoutState) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading workout...</ThemedText>
      </ThemedView>
    );
  }

  const totalSets = workoutState.exercises.reduce((acc: number, curr: any) => acc + curr.sets.length, 0);
  const completedSetsCount = workoutState.exercises.reduce(
    (acc: number, curr: any) => acc + curr.sets.filter((s: any) => s.completed).length,
    0
  );

  const filteredExercises = allExercises.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title" style={styles.title}>
          {workoutState.name}
        </ThemedText>
        {workoutState.exercises.map((exercise: any, exerciseIndex: number) => (
          <Card key={exerciseIndex} style={styles.card} elevation={2}>
            <Card.Title
              title={exercise.name}
              right={(props) => (
                <Menu
                  visible={!!menuVisible[exerciseIndex]}
                  onDismiss={() => closeMenu(exerciseIndex)}
                  anchor={<IconButton {...props} icon="dots-vertical" onPress={() => openMenu(exerciseIndex)} />}
                >
                  <Menu.Item 
                      onPress={() => {
                          router.push({ pathname: '/exercise-stats', params: { exerciseName: exercise.name }});
                          closeMenu(exerciseIndex);
                      }}
                      title="Go to stats" 
                  />
                  <Menu.Item 
                      onPress={() => {
                          showNotesDialog(exerciseIndex)
                          closeMenu(exerciseIndex);
                      }}
                      title={exercise.notes ? 'Edit note' : 'Add note'} 
                  />
                  <Menu.Item 
                      onPress={() => {
                          showEditSetsDialog(exerciseIndex);
                          closeMenu(exerciseIndex);
                      }}
                      title="Edit Sets"
                  />
                   <Menu.Item 
                      onPress={() => {
                          showSwapDialog(exerciseIndex);
                          closeMenu(exerciseIndex);
                      }}
                      title="Swap exercise"
                  />
                </Menu>
              )}
            />
            <Card.Content>
              {exercise.notes ? <ThemedText style={{ fontStyle: 'italic', margin: 4 }}>{exercise.notes}</ThemedText> : null}
              <View style={styles.chipContainer}>
                {exercise.sets.map((set: any, setIndex: number) => {
                  const weight = weightUnit === 'lb' ? ((set.weight || 0) * KG_TO_LB).toFixed(1) : (set.weight || 0);
                  const weightDisplay = (set.weight || set.weight === 0) ? `@${weight} ${weightUnit}` : '';
                  return (
                    <Chip
                      key={setIndex}
                      style={styles.chip}
                      selected={set.completed}
                      onPress={() => handleToggleSet(exerciseIndex, setIndex)}
                      onLongPress={() => showDialog(exerciseIndex, setIndex)}
                    >
                      {`${set.reps}${weightDisplay}`}
                    </Chip>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {isTimerActive && (
        <Surface style={[styles.timer, { backgroundColor: theme.colors.primary }]}>
          <ThemedText style={{ color: theme.colors.surface }}>
            Rest: {formatTime(timer)}
          </ThemedText>
        </Surface>
      )}

      <FAB icon="check" style={styles.fab} onPress={handleFinishWorkout} label="Done" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Edit Set</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reps"
              value={tempReps}
              onChangeText={setTempReps}
              keyboardType="numeric"
            />
            <TextInput
              label={`Weight (${weightUnit})`}
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
              style={{ marginTop: 8 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSaveSet}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={notesDialog.visible} onDismiss={hideNotesDialog}>
          <Dialog.Title>Edit Notes</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Notes"
              value={notesDialog.notes}
              onChangeText={(text) => setNotesDialog(prev => ({...prev, notes: text}))}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideNotesDialog}>Cancel</Button>
            <Button onPress={handleSaveNotes}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={swapDialog.visible} onDismiss={hideSwapDialog}>
          <Dialog.Title>Swap Exercise</Dialog.Title>
          <Dialog.Content>
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <ScrollView style={{ maxHeight: 300 }}>
                {filteredExercises.map((exerciseName, index) => (
                    <View key={index}>
                        <List.Item title={exerciseName} onPress={() => handleSwapExercise(exerciseName)} />
                        <Divider />
                    </View>
                ))}
            </ScrollView>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={editSetsDialog.visible} onDismiss={hideEditSetsDialog}>
            <Dialog.Title>Edit Sets</Dialog.Title>
            <Dialog.Content>
                <ScrollView style={{ maxHeight: 300 }}>
                    {tempSets.map((set, index) => {
                        const displayWeight = (weightUnit === 'lb' ? ((set.weight || 0) * KG_TO_LB) : (set.weight || 0)).toFixed(1);
                        return (
                            <View key={index} style={styles.editSetRow}>
                                <TextInput
                                    label="Reps"
                                    value={set.reps.toString()}
                                    onChangeText={(text) => handleTempSetChange(index, 'reps', text)}
                                    keyboardType="numeric"
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <TextInput
                                    label={`Weight (${weightUnit})`}
                                    value={displayWeight}
                                    onChangeText={(text) => handleTempSetChange(index, 'weight', text)}
                                    keyboardType="numeric"
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <IconButton icon="delete" onPress={() => handleDeleteSet(index)} />
                            </View>
                        );
                    })}
                </ScrollView>
                <Button onPress={handleAddSet} style={{ marginTop: 8 }}>Add Set</Button>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={hideEditSetsDialog}>Cancel</Button>
                <Button onPress={handleSaveSets}>Save</Button>
            </Dialog.Actions>
        </Dialog>

        <Dialog visible={summaryDialogVisible} onDismiss={handleCloseSummary}>
          <Dialog.Title>Workout Summary</Dialog.Title>
          <Dialog.Content>
            <ThemedText>Total Workout Time: {formatTime(timer)}</ThemedText>
            <ThemedText>
              Sets Completed: {completedSetsCount}/{totalSets}
            </ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseSummary}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, // Make space for FAB and timer
  },
  title: {
    margin: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
  },
  timer: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    width: 200,
    transform: [{ translateX: -100 }],
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});

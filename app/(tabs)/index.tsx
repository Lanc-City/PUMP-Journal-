
import { ThemedText } from '@/components/themed-text';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Surface,
  IconButton,
  Portal,
  Dialog,
  Chip,
} from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { useRoutines } from '@/hooks/use-routines';
import { routineStore } from '@/data/routine-store';
import { useState } from 'react';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { useSettings } from '@/hooks/use-settings';

const KG_TO_LB = 2.20462;

export default function DashboardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { activeRoutine } = useRoutines();
  const { history } = useWorkoutHistory();
  const { weightUnit } = useSettings();
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

  const handleStartWorkout = (workoutName: string) => {
    router.push({ pathname: '/active-workout', params: { workoutName } });
  };

  const getNextWorkout = () => {
    if (!activeRoutine || activeRoutine.workouts.length === 0) {
      return null;
    }

    const lastWorkoutInHistory = history
      .filter((h) => h.routineId === activeRoutine.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastWorkoutInHistory) {
      return activeRoutine.workouts[0];
    }

    const lastWorkoutIndex = activeRoutine.workouts.findIndex(
      (w) => w.name === lastWorkoutInHistory.workoutName
    );

    if (lastWorkoutIndex === -1 || lastWorkoutIndex === activeRoutine.workouts.length - 1) {
      return activeRoutine.workouts[0];
    }

    return activeRoutine.workouts[lastWorkoutIndex + 1];
  };

  const upNextWorkout = getNextWorkout();
  
  const comingUpWorkouts = activeRoutine
    ? activeRoutine.workouts.filter((workout) => workout.name !== upNextWorkout?.name)
    : [];

  const getWorkoutDetails = (workout: any) => {
    const lastInstance = history
      .filter((h) => h.workoutName === workout.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return lastInstance || workout;
  };

  const formatSet = (set: any) => {
    const weight = weightUnit === 'lb' ? (set.weight * KG_TO_LB).toFixed(1) : set.weight;
    const weightDisplay = (set.weight || set.weight === 0) ? `@${weight} ${weightUnit}` : '';
    return `${set.reps}${weightDisplay}`;
  };

  const renderWorkoutCard = (workout: any, isUpNext: boolean) => {
    const details = getWorkoutDetails(workout);
    return (
      <Card style={styles.card} elevation={2}>
        <Card.Title
          title={details.name || workout.name}
          {...(isUpNext && activeRoutine && { right: (props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => showDialog(activeRoutine.id)}
            />
          ) })}
        />
        <Card.Content>
          {details.exercises.map((exercise: any, index: number) => (
            <View key={index} style={styles.exerciseRow}>
              <ThemedText style={styles.exerciseNameText}>{exercise.name}</ThemedText>
              <View style={styles.setsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  {Array.isArray(exercise.sets) && exercise.sets.map((set, setIndex) => (
                    <Chip key={setIndex} style={styles.chip}>
                      {formatSet(set)}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            </View>
          ))}
        </Card.Content>
        {isUpNext && (
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => handleStartWorkout(workout.name)}
            >
              Start
            </Button>
          </Card.Actions>
        )}
      </Card>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Up Next</ThemedText>
        {upNextWorkout && renderWorkoutCard(upNextWorkout, true)}

        <ThemedText type="title" style={styles.comingUpTitle}>Coming Up</ThemedText>
        {comingUpWorkouts.map((workout, index) => (
          <View key={index}>{renderWorkoutCard(workout, false)}</View>
        ))}
      </ScrollView>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Delete Routine</Dialog.Title>
          <Dialog.Content>
            <ThemedText>Are you sure you want to delete this routine?</ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleDeleteRoutine}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  exerciseList: {
    marginLeft: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingRight: 8,
    paddingBottom: 8,
  },
  comingUpTitle: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 28,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  exerciseNameText: {
    width: '40%',
    fontSize: 16,
  },
  setsContainer: {
    width: '60%',
  },
  chip: {
    marginHorizontal: 4,
  },
});

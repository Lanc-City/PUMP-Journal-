
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, Chip } from 'react-native-paper';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Workout } from '@/data/routine-store';
import { useRoutines } from '@/hooks/use-routines';
import { useSettings } from '@/hooks/use-settings';

const KG_TO_LB = 2.20462;

export default function ViewRoutineScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines } = useRoutines();
  const { weightUnit } = useSettings();

  const routine = routines.find((r) => r.id === (Array.isArray(id) ? id[0] : id));

  const handleEditWorkout = () => {
    if (routine) {
      router.push(`/create-routine?id=${routine.id}`);
    }
  };

  const formatSet = (set: any) => {
    const weight = weightUnit === 'lb' ? (set.weight * KG_TO_LB).toFixed(1) : set.weight;
    const weightDisplay = (set.weight || set.weight === 0) ? `@${weight} ${weightUnit}` : '';
    return `${set.reps}${weightDisplay}`;
  };

  const renderItem = ({ item }: { item: Workout }) => {
    return (
      <Card style={styles.card} onPress={handleEditWorkout}>
        <Card.Title title={item.name} />
        <Card.Content>
          {item.exercises.map((exercise, index) => (
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
      </Card>
    );
  };

  if (!routine) {
    return (
      <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ThemedText>Routine not found!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{routine.name}</ThemedText>
      <FlatList
        data={routine.workouts}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
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

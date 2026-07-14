
import { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Button, Card, Searchbar, Switch, Text, TextInput, List, Chip } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { exercises, muscleGroups } from '@/data/exercises';
import { workoutBuilderStore, Exercise } from '@/data/workout-store';

export default function AddExerciseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(8);
  const [notes, setNotes] = useState('');
  const [rest, setRest] = useState('120');
  const [isSuperset, setIsSuperset] = useState(false);
  const [progressionAmount, setProgressionAmount] = useState('2.5');
  const [progressionStrategy, setProgressionStrategy] = useState('Every workout');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.exercise && typeof params.exercise === 'string') {
        const exerciseToEdit = JSON.parse(params.exercise) as Exercise;
        setEditingExercise(exerciseToEdit);
        setSearchQuery(exerciseToEdit.name);
        setSets(exerciseToEdit.sets.length);
        setReps(exerciseToEdit.sets[0]?.reps || 8);
        setNotes(exerciseToEdit.notes || '');
        setRest(String(exerciseToEdit.rest || '120'));
        setIsSuperset(exerciseToEdit.isSuperset || false);
        setProgressionAmount(String(exerciseToEdit.progression?.amount || '2.5'));
        setProgressionStrategy(exerciseToEdit.progression?.strategy || 'Every workout');
    }
  }, [params.exercise]);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesMuscleGroup =
      selectedMuscleGroup === 'All' || exercise.muscleGroup === selectedMuscleGroup;
    const matchesSearchQuery = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesMuscleGroup && matchesSearchQuery;
  });

  const handleSelectExercise = (item: { name: string; muscleGroup: string }) => {
    setSearchQuery(item.name);
    setIsSearching(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSave = () => {
    const exerciseToSave: Exercise = {
      name: searchQuery,
      type: 'Weighted', // Default type for new exercises
      sets: Array.from({ length: sets }, () => ({ reps: reps })),
      isSuperset: isSuperset,
      notes: notes,
      rest: parseInt(rest, 10) || 0,
      progression: {
        amount: parseFloat(progressionAmount) || 0,
        strategy: progressionStrategy,
      },
    };

    if (editingExercise) {
      const updatedExercise: Exercise = {
        ...editingExercise,
        name: exerciseToSave.name,
        sets: exerciseToSave.sets,
        isSuperset: exerciseToSave.isSuperset,
        notes: exerciseToSave.notes,
        rest: exerciseToSave.rest,
        progression: exerciseToSave.progression,
      };
      workoutBuilderStore.updateExercise(updatedExercise);
    } else {
      workoutBuilderStore.addExercise(exerciseToSave);
    }
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editingExercise ? 'Edit Exercise' : 'Add Exercise',
      headerRight: () =>
        isSearching ? (
          <Button onPress={() => setIsSearching(false)}>Cancel</Button>
        ) : (
          <Button onPress={handleSave}>Save</Button>
        ),
    });
  }, [navigation, isSearching, handleSave, editingExercise]);

  return (
    <ThemedView style={styles.container}>
      <Searchbar
        placeholder="Search for an exercise"
        onChangeText={handleSearchChange}
        onFocus={() => setIsSearching(true)}
        value={searchQuery}
        style={styles.searchbar}
      />

      {isSearching ? (
        <View>
          <View style={styles.chipsContainer}>
            <FlatList
              data={muscleGroups}
              renderItem={({ item }) => (
                <Chip
                  selected={selectedMuscleGroup === item}
                  onPress={() => setSelectedMuscleGroup(item)}
                  style={styles.chip}
                >
                  {item}
                </Chip>
              )}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <FlatList
            data={filteredExercises}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                onPress={() => handleSelectExercise(item)}
              />
            )}
            keyExtractor={(item, index) => item.name + index}
          />
        </View>
      ) : (
        <View>
          <View style={styles.cardRow}>
            <Card style={styles.card}>
              <Card.Content>
                <Text>Sets</Text>
                <View style={styles.cardActions}>
                  <Button onPress={() => setSets(sets - 1)}>-</Button>
                  <Text>{sets}</Text>
                  <Button onPress={() => setSets(sets + 1)}>+</Button>
                </View>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text>Reps</Text>
                <View style={styles.cardActions}>
                  <Button onPress={() => setReps(reps - 1)}>-</Button>
                  <Text>{reps}</Text>
                  <Button onPress={() => setReps(reps + 1)}>+</Button>
                </View>
              </Card.Content>
            </Card>
          </View>
          <TextInput
            label="Routine Notes"
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
          />
          <TextInput
            label="Rest (seconds)"
            keyboardType="numeric"
            style={styles.input}
            value={rest}
            onChangeText={setRest}
          />
          <View style={styles.switchRow}>
            <Text>Superset next exercise</Text>
            <Switch value={isSuperset} onValueChange={setIsSuperset} />
          </View>
          <Text style={styles.title}>Progressive Overload</Text>
          <TextInput
            label="Amount to increase"
            keyboardType="numeric"
            style={styles.input}
            value={progressionAmount}
            onChangeText={setProgressionAmount}
          />
          <TextInput
            label="Increase strategy"
            style={styles.input}
            value={progressionStrategy}
            onChangeText={setProgressionStrategy}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 10,
  },
  chipsContainer: {
    marginVertical: 10,
    height: 50,
  },
  chip: {
    marginHorizontal: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  card: {
    width: '45%',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    margin: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  title: {
    fontSize: 20,
    margin: 10,
  },
});

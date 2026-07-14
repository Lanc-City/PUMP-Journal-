
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Searchbar, Chip, List, IconButton, FAB, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { View, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { exercises as initialExercises, muscleGroups } from '@/data/exercises';

export default function ManageExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [exercises, setExercises] = useState(initialExercises);
  const [visible, setVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('Chest');

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const addExercise = () => {
    if (newExerciseName) {
      const newExercise = { name: newExerciseName, muscleGroup: newExerciseMuscleGroup };
      const newExercises = [...exercises, newExercise].sort((a, b) => a.name.localeCompare(b.name));
      setExercises(newExercises);
      setNewExerciseName('');
      hideDialog();
    }
  };

  const deleteExercise = (exerciseToDelete: { name: string, muscleGroup: string }) => {
    setExercises(exercises.filter(exercise => exercise !== exerciseToDelete));
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesMuscleGroup = selectedMuscleGroup === 'All' || exercise.muscleGroup === selectedMuscleGroup;
    const matchesSearchQuery = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscleGroup && matchesSearchQuery;
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Manage Exercises</ThemedText>
      <Searchbar
        placeholder="Search exercises"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
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
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <FlatList
        data={filteredExercises}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            right={() => <IconButton icon="delete" onPress={() => deleteExercise(item)} />}
          />
        )}
        keyExtractor={(item, index) => item.name + index}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showDialog}
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Add New Exercise</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Exercise Name"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            {/* You might want to replace this with a dropdown picker */}
            <TextInput
              label="Muscle Group"
              value={newExerciseMuscleGroup}
              onChangeText={setNewExerciseMuscleGroup}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={addExercise}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginTop: 16,
  },
  chipsContainer: {
    marginTop: 16,
    height: 50, // Adjust height as needed
  },
  chip: {
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

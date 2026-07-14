
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, IconButton, Chip, Menu, Portal } from 'react-native-paper';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAppTheme } from '@/hooks/useAppTheme';
import { routineStore } from '@/data/routine-store';
import { useSettings } from '@/hooks/use-settings';

const KG_TO_LB = 2.20462;

export default function HistoryScreen() {
  const { history } = useWorkoutHistory();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const theme = useAppTheme();
  const [visibleMenu, setVisibleMenu] = useState('');
  const { weightUnit } = useSettings();

  const openMenu = (id: string) => setVisibleMenu(id);
  const closeMenu = () => setVisibleMenu('');

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleDelete = (id: string) => {
    routineStore.deleteWorkoutFromHistory(id);
    closeMenu();
  };

  const filteredWorkouts = history ? history.filter(
    (workout) => workout.date.split('T')[0] === selectedDate
  ) : [];

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.workoutName}
        subtitle={`Completed on ${new Date(item.date).toLocaleDateString()} in ${formatDuration(item.duration)}`}
        right={(props) => (
            <Menu
              visible={visibleMenu === item.id}
              onDismiss={closeMenu}
              anchor={<IconButton {...props} icon="dots-vertical" onPress={() => openMenu(item.id)} />}>
              <Menu.Item onPress={() => handleDelete(item.id)} title="Delete" />
            </Menu>
          )}
      />
      <Card.Content>
        {item.exercises.map((exercise: any, index: number) => (
          <View key={index} style={styles.exerciseContainer}>
            <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
            <FlatList
              horizontal
              data={exercise.sets}
              keyExtractor={(set, setIndex) => setIndex.toString()}
              renderItem={({ item: set }) => {
                const weight = weightUnit === 'lb' ? (set.weight * KG_TO_LB).toFixed(1) : set.weight;
                const weightDisplay = (set.weight || set.weight === 0) ? `@${weight} ${weightUnit}` : '';
                return (
                  <Chip style={styles.chip}>{`${set.reps}${weightDisplay}`}</Chip>
                )
              }}
            />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <Portal.Host>
        <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Card style={styles.card} elevation={2}>
                <Calendar onDayPress={onDayPress} markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }} theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: theme.colors.onSurface,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: theme.colors.onPrimary,
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.onSurface,
                    textDisabledColor: theme.colors.backdrop,
                    dotColor: theme.colors.primary,
                    selectedDotColor: theme.colors.onPrimary,
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.onSurface,
                    indicatorColor: theme.colors.primary,
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16
                }} />
            </Card>
          <FlatList
            data={filteredWorkouts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<ThemedText style={{textAlign: 'center', marginTop: 20}}>No workouts completed on this day.</ThemedText>}
          />
        </ThemedView>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 28,
  },
  exerciseContainer: {
    marginBottom: 12,
  },
  exerciseName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
});

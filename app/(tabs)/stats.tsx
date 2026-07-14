
import { ThemedText } from '@/components/themed-text';
import { Button, Card } from 'react-native-paper';
import { StyleSheet, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { useSettings } from '@/hooks/use-settings';
import { useMemo } from 'react';
import { useRouter, Stack } from 'expo-router';

const KG_TO_LB = 2.20462;

export default function StatsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { history } = useWorkoutHistory();
  const { weightUnit } = useSettings();

  const stats = useMemo(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentHistory = history.filter(h => new Date(h.date) > ninetyDaysAgo);

    if (recentHistory.length === 0) {
      return {
        workoutsPerWeek: 0,
        setsPerWeek: 0,
        maxVolume: 0,
        avgDuration: 0,
        heaviestLift: { exercise: 'N/A', weight: 0 },
        exerciseStats: [],
      };
    }

    const weeks = (new Date().getTime() - ninetyDaysAgo.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const workoutsPerWeek = recentHistory.length / weeks;

    const totalSets = recentHistory.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
    }, 0);
    const setsPerWeek = totalSets / weeks;

    let maxVolume = 0;
    recentHistory.forEach(workout => {
        const volume = workout.exercises.reduce((vol, ex) => {
            return vol + ex.sets.reduce((v, set) => v + set.reps * set.weight, 0);
        }, 0);
        if (volume > maxVolume) maxVolume = volume;
    });

    const totalDuration = recentHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const avgDuration = totalDuration / recentHistory.length / 60000; // in minutes

    let heaviestLift = { exercise: 'N/A', weight: 0 };
    recentHistory.forEach(workout => {
        workout.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.weight > heaviestLift.weight) {
                    heaviestLift = { exercise: ex.name, weight: set.weight };
                }
            });
        });
    });
    
    const exerciseStats = [...new Set(recentHistory.flatMap(h => h.exercises.map(e => e.name)))];

    return {
      workoutsPerWeek: workoutsPerWeek.toFixed(1),
      setsPerWeek: Math.round(setsPerWeek),
      maxVolume: Math.round(weightUnit === 'lb' ? maxVolume * KG_TO_LB : maxVolume),
      avgDuration: Math.round(avgDuration),
      heaviestLift: {
          exercise: heaviestLift.exercise,
          weight: Math.round(weightUnit === 'lb' ? heaviestLift.weight * KG_TO_LB : heaviestLift.weight),
      },
      exerciseStats,
    };
  }, [history, weightUnit]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{
            headerRight: () => <Button onPress={() => {}}>Last 90 days</Button>
        }}/>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="calendar-blank" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.statValue}>{stats.workoutsPerWeek}</ThemedText>
              <ThemedText style={styles.statLabel}>Workouts/week</ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="format-list-numbered" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.statValue}>{stats.setsPerWeek}</ThemedText>
              <ThemedText style={styles.statLabel}>Sets/week</ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="weight" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.statValue}>{stats.maxVolume}</ThemedText>
              <ThemedText style={styles.statLabel}>Max Volume ({weightUnit})</ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.statValue}>{stats.avgDuration}m</ThemedText>
              <ThemedText style={styles.statLabel}>Avg. Duration</ThemedText>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.heaviestLiftCard} elevation={2}>
          <Card.Content>
            <ThemedText style={styles.heaviestLiftTitle}><MaterialCommunityIcons name="trophy" size={20} color={theme.colors.primary} /> Heaviest Lift</ThemedText>
            <ThemedText style={styles.heaviestLiftExercise}>({stats.heaviestLift.exercise})</ThemedText>
            <ThemedText style={styles.heaviestLiftValue}>{stats.heaviestLift.weight} {weightUnit}</ThemedText>
          </Card.Content>
        </Card>

        <ThemedText type="title" style={styles.exerciseStatsTitle}>Exercise Stats</ThemedText>

        {stats.exerciseStats.map(ex => (
            <Card key={ex} style={styles.exerciseStatCard} onPress={() => router.push({ pathname: '/exercise-stats', params: { exerciseName: ex }})} elevation={2}>
                <Card.Content style={styles.exerciseStatCardContent}>
                    <ThemedText>{ex}</ThemedText>
                </Card.Content>
            </Card>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  statCard: {
    width: '45%',
    marginBottom: 16,
  },
  cardContent: {
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  statLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  heaviestLiftCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  heaviestLiftTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  heaviestLiftExercise: {
    textAlign: 'center',
    marginTop: 4,
  },
  heaviestLiftValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  exerciseStatsTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  exerciseStatCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  exerciseStatCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

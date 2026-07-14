
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from 'react-native-paper';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { useSettings } from '@/hooks/use-settings';
import { useMemo } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { useAppTheme } from '@/hooks/useAppTheme';

const KG_TO_LB = 2.20462;
const screenWidth = Dimensions.get('window').width;

export default function ExerciseStatsScreen() {
  const theme = useAppTheme();
  const { exerciseName } = useLocalSearchParams();
  const { history } = useWorkoutHistory();
  const { weightUnit } = useSettings();

  const exerciseHistory = useMemo(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return history
        .filter(h => new Date(h.date) > ninetyDaysAgo)
        .map(h => ({
            ...h,
            exercises: h.exercises.filter(e => e.name === exerciseName)
        }))
        .filter(h => h.exercises.length > 0);
  }, [history, exerciseName]);

  const { volumeChartData, maxWeightChartData, oneRepMaxChartData } = useMemo(() => {
    const labels = exerciseHistory.map(h => new Date(h.date).toLocaleDateString());
    const volumeData = exerciseHistory.map(h => {
        return h.exercises.reduce((vol, ex) => {
            return vol + ex.sets.reduce((v, set) => v + set.reps * (weightUnit === 'lb' ? set.weight * KG_TO_LB : set.weight), 0);
        }, 0);
    });
    const maxWeightData = exerciseHistory.map(h => {
        let maxWeight = 0;
        h.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                const weight = weightUnit === 'lb' ? set.weight * KG_TO_LB : set.weight;
                if (weight > maxWeight) maxWeight = weight;
            });
        });
        return maxWeight;
    });
    const oneRepMaxData = exerciseHistory.map(h => {
        let max1RM = 0;
        h.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if(set.reps < 1) return;
                const oneRM = set.weight / (1.0278 - (0.0278 * set.reps));
                if (oneRM > max1RM) max1RM = oneRM;
            });
        });
        return weightUnit === 'lb' ? max1RM * KG_TO_LB : max1RM;
    });

    return {
        volumeChartData: {
            labels,
            datasets: [{ data: volumeData, color: (opacity = 1) => theme.colors.primary }]
        },
        maxWeightChartData: {
            labels,
            datasets: [{ data: maxWeightData, color: (opacity = 1) => theme.colors.tertiary }]
        },
        oneRepMaxChartData: {
            labels,
            datasets: [{ data: oneRepMaxData, color: (opacity = 1) => theme.colors.notification }]
        }
    };
  }, [exerciseHistory, weightUnit, theme]);

  const personalBests = useMemo(() => {
    let bestSet = { reps: 0, weight: 0 };
    let maxWeight = 0;
    let maxReps = 0;
    let oneRepMax = 0;

    exerciseHistory.forEach(h => {
        h.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.reps * set.weight > bestSet.reps * bestSet.weight) {
                    bestSet = set;
                }
                if (set.weight > maxWeight) {
                    maxWeight = set.weight;
                }
                if (set.reps > maxReps) {
                    maxReps = set.reps;
                }
                if(set.reps > 0 && set.weight > 0) {
                    const oneRM = set.weight / (1.0278 - (0.0278 * set.reps));
                    if (oneRM > oneRepMax) {
                        oneRepMax = oneRM;
                    }
                }
            });
        });
    });

    return {
      bestSet: {
        reps: bestSet.reps,
        weight: (weightUnit === 'lb' ? (bestSet.weight * KG_TO_LB) : bestSet.weight).toFixed(1)
      },
      maxWeight: (weightUnit === 'lb' ? (maxWeight * KG_TO_LB) : maxWeight).toFixed(1),
      maxReps,
      oneRepMax: (weightUnit === 'lb' ? (oneRepMax * KG_TO_LB) : oneRepMax).toFixed(1)
    }
  }, [exerciseHistory, weightUnit]);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(127, 127, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(127, 127, 127, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    },
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withInnerLines: false,
    withOuterLines: false,
    withShadow: false,
    transparent: true,
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: exerciseName as string }} />
      <ThemedView style={styles.container}>

        <ThemedText type="title" style={styles.sectionTitle}>Personal Bests</ThemedText>
        <View style={styles.bestsGrid}>
          <Card style={styles.bestCard} elevation={2}>
            <Card.Content>
              <ThemedText style={styles.bestValue}>{personalBests.bestSet.reps}x{personalBests.bestSet.weight} {weightUnit}</ThemedText>
              <ThemedText style={styles.bestLabel}>Best Set</ThemedText>
            </Card.Content>
          </Card>
          <Card style={styles.bestCard} elevation={2}>
            <Card.Content>
              <ThemedText style={styles.bestValue}>{personalBests.maxWeight} {weightUnit}</ThemedText>
              <ThemedText style={styles.bestLabel}>Max Weight</ThemedText>
            </Card.Content>
          </Card>
          <Card style={styles.bestCard} elevation={2}>
            <Card.Content>
              <ThemedText style={styles.bestValue}>{personalBests.maxReps}</ThemedText>
              <ThemedText style={styles.bestLabel}>Max Reps</ThemedText>
            </Card.Content>
          </Card>
          <Card style={styles.bestCard} elevation={2}>
            <Card.Content>
              <ThemedText style={styles.bestValue}>{personalBests.oneRepMax} {weightUnit}</ThemedText>
              <ThemedText style={styles.bestLabel}>One Rep Max</ThemedText>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard} elevation={2}>
            <Card.Title title="Volume Over Time" />
            <Card.Content>
                {volumeChartData.datasets[0].data.length > 0 ?
                    <LineChart
                        data={volumeChartData}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    /> : <ThemedText style={{textAlign: 'center'}}>No data to display</ThemedText>}
            </Card.Content>
        </Card>

        <Card style={styles.chartCard} elevation={2}>
            <Card.Title title="Max Weight Over Time" />
            <Card.Content>
                {maxWeightChartData.datasets[0].data.length > 0 ?
                    <LineChart
                        data={maxWeightChartData}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={{...chartConfig, propsForDots: {...chartConfig.propsForDots, stroke: theme.colors.tertiary}}}
                        bezier
                        style={styles.chart}
                    /> : <ThemedText style={{textAlign: 'center'}}>No data to display</ThemedText>}
            </Card.Content>
        </Card>
        
        <Card style={styles.chartCard} elevation={2}>
            <Card.Title title="One Rep Max Over Time" />
            <Card.Content>
                {oneRepMaxChartData.datasets[0].data.length > 0 ?
                    <LineChart
                        data={oneRepMaxChartData}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={{...chartConfig, propsForDots: {...chartConfig.propsForDots, stroke: theme.colors.notification}}}
                        bezier
                        style={styles.chart}
                    /> : <ThemedText style={{textAlign: 'center'}}>No data to display</ThemedText>}
            </Card.Content>
        </Card>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 16,
    textAlign: 'center',
    fontSize: 32,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  bestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  bestCard: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 16,
  },
  bestValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bestLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  chart: {
      marginVertical: 8,
      borderRadius: 16,
  },
  chartCard: {
      marginHorizontal: 16,
      marginVertical: 8,
  }
});

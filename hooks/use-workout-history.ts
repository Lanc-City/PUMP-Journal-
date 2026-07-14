
import { useState, useEffect } from 'react';
import { routineStore, CompletedWorkout } from '@/data/routine-store';

export const useWorkoutHistory = () => {
  const [history, setHistory] = useState<CompletedWorkout[]>(routineStore.history);

  useEffect(() => {
    const unsubscribe = routineStore.subscribe(() => {
      setHistory([...routineStore.history]);
    });

    routineStore.initialize();

    return () => unsubscribe();
  }, []);

  return { history };
};

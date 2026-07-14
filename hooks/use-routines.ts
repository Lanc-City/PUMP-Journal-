
import { useState, useEffect } from 'react';
import { routineStore, Routine } from '@/data/routine-store';

export const useRoutines = () => {
  const [routines, setRoutines] = useState<Routine[]>(routineStore.routines);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(
    routineStore.getActiveRoutine()
  );

  useEffect(() => {
    const unsubscribe = routineStore.subscribe(() => {
      setRoutines([...routineStore.routines]);
      setActiveRoutine(routineStore.getActiveRoutine());
    });

    routineStore.initialize();

    return () => unsubscribe();
  }, []);

  return { routines, activeRoutine };
};

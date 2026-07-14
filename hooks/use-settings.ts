
import { useState, useEffect } from 'react';
import { settingsStore } from '@/data/settings-store';

type WeightUnit = 'kg' | 'lb';

export const useSettings = () => {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(settingsStore.weightUnit);

  useEffect(() => {
    const unsubscribe = settingsStore.subscribe(() => {
      setWeightUnit(settingsStore.weightUnit);
    });

    settingsStore.initialize();

    return () => unsubscribe();
  }, []);

  const setUnit = (unit: WeightUnit) => {
    settingsStore.setWeightUnit(unit);
  };

  return { weightUnit, setUnit };
};

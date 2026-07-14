
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHT_UNIT_STORAGE_KEY = 'weightUnit';

type WeightUnit = 'kg' | 'lb';
type Listener = () => void;

class SettingsStoreSingleton {
  weightUnit: WeightUnit = 'kg';
  private listeners: Listener[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }
    await this.loadData();
    this.isInitialized = true;
  }

  async loadData() {
    try {
      const weightUnit = await AsyncStorage.getItem(WEIGHT_UNIT_STORAGE_KEY);
      if (weightUnit) {
        this.weightUnit = weightUnit as WeightUnit;
      }
      this.notifyListeners();
    } catch (e) {
      console.error("Failed to load data.", e);
    }
  }

  async saveData() {
    try {
      await AsyncStorage.setItem(WEIGHT_UNIT_STORAGE_KEY, this.weightUnit);
    } catch (e) {
      console.error("Failed to save data.", e);
    }
  }

  setWeightUnit(unit: WeightUnit) {
    this.weightUnit = unit;
    this.notifyListeners();
    this.saveData();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }
}

export const settingsStore = new SettingsStoreSingleton();

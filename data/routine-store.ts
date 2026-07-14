
import { workoutBuilderStore, Exercise } from './workout-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTINES_STORAGE_KEY = 'routines';
const ACTIVE_ROUTINE_ID_STORAGE_KEY = 'activeRoutineId';
const HISTORY_STORAGE_KEY = 'workoutHistory';

export interface Workout {
  name: string;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workouts: Workout[];
}

export interface CompletedWorkout {
    id: string;
    workoutName: string;
    date: string;
    duration: number; // in seconds
    exercises: {
        name: string;
        sets: { reps: number; weight: number; completed: boolean }[];
    }[];
}

type Listener = () => void;

class RoutineStoreSingleton {
  routines: Routine[] = [];
  activeRoutineId: string | null = null;
  history: CompletedWorkout[] = [];
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
      const routinesJson = await AsyncStorage.getItem(ROUTINES_STORAGE_KEY);
      if (routinesJson) {
        this.routines = JSON.parse(routinesJson);
      }
      const activeId = await AsyncStorage.getItem(ACTIVE_ROUTINE_ID_STORAGE_KEY);
      this.activeRoutineId = activeId;

      const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyJson) {
        this.history = JSON.parse(historyJson);
      }

      this.notifyListeners();
    } catch (e) {
      console.error("Failed to load data.", e);
    }
  }

  async saveData() {
    try {
      await AsyncStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(this.routines));
      if (this.activeRoutineId) {
        await AsyncStorage.setItem(ACTIVE_ROUTINE_ID_STORAGE_KEY, this.activeRoutineId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_ROUTINE_ID_STORAGE_KEY);
      }
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error("Failed to save data.", e);
    }
  }

  createRoutine(name: string) {
    const newRoutine: Routine = {
      id: Date.now().toString() + Math.random().toString(),
      name: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workouts: [],
    };
    this.routines.push(newRoutine);
    this.notifyListeners();
    this.saveData();
    return newRoutine.id;
  }

  deleteRoutine(id: string) {
    this.routines = this.routines.filter(r => r.id !== id);
    if (this.activeRoutineId === id) {
      this.activeRoutineId = null;
    }
    this.notifyListeners();
    this.saveData();
  }

  setActiveRoutine(id: string) {
    this.activeRoutineId = id;
    this.notifyListeners();
    this.saveData();
  }

  updateRoutineName(id: string, name: string) {
    const routine = this.routines.find(r => r.id === id);
    if (routine) {
      routine.name = name;
      routine.updatedAt = new Date().toISOString();
      this.notifyListeners();
      this.saveData();
    }
  }

  addWorkoutToRoutine(routineId: string, workoutName: string) {
    const routine = this.routines.find(r => r.id === routineId);
    if (routine) {
      const newWorkout: Workout = {
        name: workoutName,
        exercises: workoutBuilderStore.getExercises(),
      };
      routine.workouts.push(newWorkout);
      routine.updatedAt = new Date().toISOString();
      workoutBuilderStore.clearWorkout();
      this.notifyListeners();
      this.saveData();
    }
  }

  reorderWorkouts(routineId: string, orderedWorkouts: Workout[]) {
    const routine = this.routines.find(r => r.id === routineId);
    if (routine) {
      routine.workouts = orderedWorkouts;
      routine.updatedAt = new Date().toISOString();
      this.notifyListeners();
      this.saveData();
    }
  }

  addWorkoutToHistory(workout: any, duration: number) {
      const completedWorkout: CompletedWorkout = {
          id: Date.now().toString() + Math.random().toString(),
          workoutName: workout.name,
          date: new Date().toISOString(),
          duration,
          exercises: workout.exercises.map((e: any) => ({
              name: e.name,
              sets: e.sets.map((s: any) => ({ reps: s.reps, weight: s.weight, completed: s.completed }))
          }))
      }
      this.history.push(completedWorkout);
      this.notifyListeners();
      this.saveData();
  }

  deleteWorkoutFromHistory(id: string) {
    this.history = this.history.filter(w => w.id !== id);
    this.notifyListeners();
    this.saveData();
  }

  getRoutine(id: string) {
    return this.routines.find(r => r.id === id);
  }

  getActiveRoutine() {
    if (!this.activeRoutineId) {
      return this.routines.length > 0 ? this.routines[0] : null;
    }
    return this.routines.find(r => r.id === this.activeRoutineId);
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

export const routineStore = new RoutineStoreSingleton();

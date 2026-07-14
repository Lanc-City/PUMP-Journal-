
export interface Exercise {
  name: string;
  type: 'Weighted' | 'Cardio/Time';
  sets: { reps: number; weight?: number }[];
  isSuperset: boolean;
  notes: string;
  rest: number;
  progression: {
    amount: number;
    strategy: string;
  };
}

type Listener = () => void;

class WorkoutBuilderStoreSingleton {
  private exercises: Exercise[] = [];
  private listeners: Listener[] = [];

  addExercise(exercise: Exercise) {
    this.exercises.push(exercise);
    this.notifyListeners();
  }

  updateExercise(updatedExercise: Exercise) {
    const index = this.exercises.findIndex(ex => ex.name === updatedExercise.name);
    if (index !== -1) {
      this.exercises[index] = updatedExercise;
      this.notifyListeners();
    }
  }

  loadWorkout(workout: { exercises: Exercise[] }) {
    this.exercises = workout.exercises;
    this.notifyListeners();
  }

  getExercises() {
    return this.exercises;
  }

  clearWorkout() {
    this.exercises = [];
    this.notifyListeners();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }
}

export const workoutBuilderStore = new WorkoutBuilderStoreSingleton();

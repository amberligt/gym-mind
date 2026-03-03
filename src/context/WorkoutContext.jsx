import { createContext, useContext } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import { useAuth } from './AuthContext';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const workout = useWorkout(user?.id);
  return (
    <WorkoutContext.Provider value={workout}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error('useWorkoutContext must be used within WorkoutProvider');
  }
  return ctx;
}

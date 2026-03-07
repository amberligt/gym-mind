import { createRoot } from 'react-dom/client';
import './index.css';
import ExerciseTypesIntro from './components/ExerciseTypesIntro';

const root = document.getElementById('root');
root && createRoot(root).render(
  <ExerciseTypesIntro onBack={() => window.history.back()} />
);

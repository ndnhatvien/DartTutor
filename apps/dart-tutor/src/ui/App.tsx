import { useState } from 'react';
import { getAllLessons, getExerciseById } from '../content/loader';
import type { LessonProgress } from '../content/types';
import ExerciseView from './ExerciseView';
import Layout from './Layout';
import LessonList from './LessonList';
import ProgressPanel from './ProgressPanel';

type View = 'lesson-list' | 'exercise';

export default function App() {
  const [view, setView] = useState<View>('lesson-list');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const lessons = getAllLessons();
  const progress = new Map<string, LessonProgress>();

  const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);

  const handleSelectLesson = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson?.exercises && lesson.exercises.length > 0) {
      setSelectedLessonId(lessonId);
      setSelectedExerciseId(lesson.exercises[0]?.id ?? null);
      setView('exercise');
    }
  };

  const handleBack = () => {
    setView('lesson-list');
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
  };

  const handleNextExercise = () => {
    if (!selectedLessonId) return;

    const lesson = lessons.find((l) => l.id === selectedLessonId);
    if (!lesson) return;

    const currentIndex = lesson.exercises.findIndex((ex) => ex.id === selectedExerciseId);
    if (currentIndex < lesson.exercises.length - 1) {
      const nextExercise = lesson.exercises[currentIndex + 1];
      if (nextExercise) {
        setSelectedExerciseId(nextExercise.id);
      }
    }
  };

  const currentExercise =
    selectedLessonId && selectedExerciseId
      ? getExerciseById(selectedLessonId, selectedExerciseId)
      : null;

  const currentLesson = lessons.find((l) => l.id === selectedLessonId);
  const isLastExercise =
    currentLesson &&
    selectedExerciseId === currentLesson.exercises[currentLesson.exercises.length - 1]?.id;

  return (
    <Layout>
      {view === 'lesson-list' && (
        <>
          <LessonList lessons={lessons} progress={progress} onSelectLesson={handleSelectLesson} />
          <ProgressPanel
            progress={progress}
            totalLessons={lessons.length}
            totalExercises={totalExercises}
          />
        </>
      )}

      {view === 'exercise' && currentExercise && (
        <ExerciseView
          exercise={currentExercise}
          onBack={handleBack}
          onNextExercise={isLastExercise ? undefined : handleNextExercise}
        />
      )}
    </Layout>
  );
}

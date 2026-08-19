import { useState } from 'react';
import { getAllLessons, getExerciseById } from '../content/loader';
import type { LessonProgress } from '../content/types';
import { learnerStateManager } from '../learner/singleton';
import ExerciseView from './ExerciseView';
import Layout from './Layout';
import LessonList from './LessonList';
import LessonView from './LessonView';
import ProgressPanel from './ProgressPanel';

type View = 'lesson-list' | 'lesson' | 'exercise';

function buildProgressMap(lessons: ReturnType<typeof getAllLessons>) {
  const map = new Map<string, LessonProgress>();
  for (const lesson of lessons) {
    const { completed, total } = learnerStateManager.getProgress(
      lesson.id,
      lesson.exercises.length
    );
    map.set(lesson.id, {
      lessonId: lesson.id,
      exercisesCompleted: completed,
      exercisesTotal: total,
      masteryLevel: total > 0 ? completed / total : 0,
      lastActivityAt: null,
    });
  }
  return map;
}

export default function App() {
  const [view, setView] = useState<View>('lesson-list');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const lessons = getAllLessons();
  const progress = buildProgressMap(lessons);

  const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);

  const handleSelectLesson = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setSelectedLessonId(lessonId);
      setView('lesson');
    }
  };

  const handleStartExercises = () => {
    const lesson = lessons.find((l) => l.id === selectedLessonId);
    if (lesson?.exercises && lesson.exercises.length > 0) {
      setSelectedExerciseId(lesson.exercises[0]?.id ?? null);
      setView('exercise');
    }
  };

  const handleBack = () => {
    setView('lesson-list');
    setSelectedLessonId(null);
    setSelectedExerciseId(null);
    setRefreshCounter((c) => c + 1);
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
        <div key={refreshCounter}>
          <LessonList lessons={lessons} progress={progress} onSelectLesson={handleSelectLesson} />
          <ProgressPanel
            progress={progress}
            totalLessons={lessons.length}
            totalExercises={totalExercises}
          />
        </div>
      )}

      {view === 'lesson' && currentLesson && (
        <LessonView
          lesson={currentLesson}
          onBack={handleBack}
          onStartExercises={handleStartExercises}
        />
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

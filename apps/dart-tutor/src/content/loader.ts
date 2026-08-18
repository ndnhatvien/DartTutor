import asyncAwaitLesson from '../../content/lessons/async-await.json';
import basicsLesson from '../../content/lessons/basics.json';
import collectionsLesson from '../../content/lessons/collections.json';
import controlFlowLesson from '../../content/lessons/control-flow.json';
import functionsNullLesson from '../../content/lessons/functions-null-safety.json';
import flutterAnimationLesson from '../../content/lessons/flutter-animation.json';
import flutterBasicsLesson from '../../content/lessons/flutter-basics.json';
import flutterFormsLesson from '../../content/lessons/flutter-forms.json';
import flutterLayoutsLesson from '../../content/lessons/flutter-layouts.json';
import flutterNavigationLesson from '../../content/lessons/flutter-navigation.json';
import flutterNetworkingLesson from '../../content/lessons/flutter-networking.json';
import flutterStateLesson from '../../content/lessons/flutter-state.json';
import flutterStorageLesson from '../../content/lessons/flutter-storage.json';
import flutterThemesLesson from '../../content/lessons/flutter-themes.json';
import flutterWidgetsLesson from '../../content/lessons/flutter-widgets.json';
import type { Exercise, Lesson } from './types';

const difficultyOrder: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

function sortByDifficulty(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort(
    (a, b) => (difficultyOrder[a.difficulty] ?? 0) - (difficultyOrder[b.difficulty] ?? 0)
  );
}

const lessons: Lesson[] = [
  basicsLesson as Lesson,
  controlFlowLesson as Lesson,
  functionsNullLesson as Lesson,
  collectionsLesson as Lesson,
  asyncAwaitLesson as Lesson,
  flutterBasicsLesson as Lesson,
  flutterLayoutsLesson as Lesson,
  flutterWidgetsLesson as Lesson,
  flutterStateLesson as Lesson,
  flutterNavigationLesson as Lesson,
  flutterFormsLesson as Lesson,
  flutterAnimationLesson as Lesson,
  flutterNetworkingLesson as Lesson,
  flutterStorageLesson as Lesson,
  flutterThemesLesson as Lesson,
].map((lesson) => ({
  ...lesson,
  exercises: sortByDifficulty(lesson.exercises as Exercise[]),
}));

export function getAllLessons(): Lesson[] {
  return lessons;
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getExerciseById(lessonId: string, exerciseId: string) {
  const lesson = getLessonById(lessonId);
  return lesson?.exercises.find((ex) => ex.id === exerciseId);
}

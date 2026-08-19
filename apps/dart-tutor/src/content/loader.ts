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
  basicsLesson as unknown as Lesson,
  controlFlowLesson as unknown as Lesson,
  functionsNullLesson as unknown as Lesson,
  collectionsLesson as unknown as Lesson,
  asyncAwaitLesson as unknown as Lesson,
  flutterBasicsLesson as unknown as Lesson,
  flutterLayoutsLesson as unknown as Lesson,
  flutterWidgetsLesson as unknown as Lesson,
  flutterStateLesson as unknown as Lesson,
  flutterNavigationLesson as unknown as Lesson,
  flutterFormsLesson as unknown as Lesson,
  flutterAnimationLesson as unknown as Lesson,
  flutterNetworkingLesson as unknown as Lesson,
  flutterStorageLesson as unknown as Lesson,
  flutterThemesLesson as unknown as Lesson,
].map((lesson) => ({
  ...lesson,
  theory: lesson.theory ?? [],
  examples: lesson.examples ?? [],
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

import asyncAwaitLesson from '../../content/lessons/async-await.json';
import basicsLesson from '../../content/lessons/basics.json';
import collectionsLesson from '../../content/lessons/collections.json';
import controlFlowLesson from '../../content/lessons/control-flow.json';
import functionsNullLesson from '../../content/lessons/functions-null-safety.json';
import type { Lesson } from './types';

const lessons: Lesson[] = [
  basicsLesson as Lesson,
  controlFlowLesson as Lesson,
  functionsNullLesson as Lesson,
  collectionsLesson as Lesson,
  asyncAwaitLesson as Lesson,
];

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

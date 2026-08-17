import basicsLesson from '../../content/lessons/basics.json';
import type { Lesson } from './types';

const lessons: Lesson[] = [basicsLesson as Lesson];

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

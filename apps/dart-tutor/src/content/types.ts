export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseStatus =
  | 'new'
  | 'attempted'
  | 'first_failure'
  | 'second_failure'
  | 'repeated_failure'
  | 'passed'
  | 'mastered';

export interface CommonMistake {
  id: string;
  pattern: string;
  explanation: string;
  hint: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  conceptTags: string[];
  difficulty: Difficulty;
  instructions: string;
  starterCode: string;
  testCode: string;
  solutionCode: string;
  hints: string[];
  expectedConcepts: string[];
  commonMistakes: CommonMistake[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  theory: TheorySection[];
  examples: Example[];
  exercises: Exercise[];
}

export interface TheorySection {
  title: string;
  content: string[];
}

export interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
}

export interface LessonProgress {
  lessonId: string;
  exercisesCompleted: number;
  exercisesTotal: number;
  masteryLevel: number;
  lastActivityAt: string | null;
}

import type { Lesson, LessonProgress } from '../content/types';

interface LessonListProps {
  lessons: Lesson[];
  progress: Map<string, LessonProgress>;
  onSelectLesson: (lessonId: string) => void;
}

function getPrerequisiteTitles(prerequisites: string[], lessons: Lesson[]): string[] {
  return prerequisites.map((id) => {
    const lesson = lessons.find((l) => l.id === id);
    return lesson?.title ?? id;
  });
}

function LessonCard({
  lesson,
  lessons,
  progress,
  onSelectLesson,
}: {
  lesson: Lesson;
  lessons: Lesson[];
  progress: Map<string, LessonProgress>;
  onSelectLesson: (lessonId: string) => void;
}) {
  const lessonProgress = progress.get(lesson.id);
  const completionRate = lessonProgress
    ? Math.round((lessonProgress.exercisesCompleted / lessonProgress.exercisesTotal) * 100)
    : 0;

  return (
    <button
      onClick={() => onSelectLesson(lesson.id)}
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
      }}
      type="button"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '1rem' }}>
            {lesson.title}
          </h3>
          <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.85rem' }}>
            {lesson.description}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>📝 {lesson.exercises.length} bài tập</span>
            {lesson.prerequisites.length > 0 && (
              <span>
                ⚡ Yêu cầu: {getPrerequisiteTitles(lesson.prerequisites, lessons).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '70px' }}>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 'bold',
              color: completionRate === 100 ? '#10b981' : '#3b82f6',
            }}
          >
            {completionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {lessonProgress?.exercisesCompleted || 0}/{lesson.exercises.length}
          </div>
        </div>
      </div>
    </button>
  );
}

function LessonSection({
  title,
  icon,
  color,
  lessons,
  progress,
  onSelectLesson,
}: {
  title: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  progress: Map<string, LessonProgress>;
  onSelectLesson: (lessonId: string) => void;
}) {
  const totalExercises = lessons.reduce((sum, l) => sum + l.exercises.length, 0);
  const completedExercises = lessons.reduce((sum, l) => {
    const p = progress.get(l.id);
    return sum + (p?.exercisesCompleted || 0);
  }, 0);
  const sectionRate =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: `2px solid ${color}20`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>{title}</h2>
          <span
            style={{
              fontSize: '0.8rem',
              color,
              backgroundColor: `${color}15`,
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontWeight: 500,
            }}
          >
            {lessons.length} bài học
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: sectionRate === 100 ? '#10b981' : color,
            }}
          >
            {sectionRate}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {completedExercises}/{totalExercises}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            lessons={lessons}
            progress={progress}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>
    </div>
  );
}

export default function LessonList({ lessons, progress, onSelectLesson }: LessonListProps) {
  const dartLessons = lessons.filter((l) => !l.id.startsWith('flutter-'));
  const flutterLessons = lessons.filter((l) => l.id.startsWith('flutter-'));

  return (
    <div style={{ padding: '2rem' }}>
      <LessonSection
        title="Dart"
        icon="🎯"
        color="#0175C2"
        lessons={dartLessons}
        progress={progress}
        onSelectLesson={onSelectLesson}
      />
      <LessonSection
        title="Flutter"
        icon="💙"
        color="#02569B"
        lessons={flutterLessons}
        progress={progress}
        onSelectLesson={onSelectLesson}
      />
    </div>
  );
}

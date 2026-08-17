import type { Lesson, LessonProgress } from '../content/types';

interface LessonListProps {
  lessons: Lesson[];
  progress: Map<string, LessonProgress>;
  onSelectLesson: (lessonId: string) => void;
}

export default function LessonList({ lessons, progress, onSelectLesson }: LessonListProps) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>📚 Danh sách bài học</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.map((lesson) => {
          const lessonProgress = progress.get(lesson.id);
          const completionRate = lessonProgress
            ? Math.round((lessonProgress.exercisesCompleted / lessonProgress.exercisesTotal) * 100)
            : 0;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>{lesson.title}</h3>
                  <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                    {lesson.description}
                  </p>
                  <div
                    style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}
                  >
                    <span>📝 {lesson.exercises.length} bài tập</span>
                    {lesson.prerequisites.length > 0 && (
                      <span>⚡ Yêu cầu: {lesson.prerequisites.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div
                    style={{
                      fontSize: '1.25rem',
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
        })}
      </div>
    </div>
  );
}

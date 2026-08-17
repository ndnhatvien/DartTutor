import type { LessonProgress } from '../content/types';

interface ProgressPanelProps {
  progress: Map<string, LessonProgress>;
  totalLessons: number;
  totalExercises: number;
}

export default function ProgressPanel({
  progress,
  totalLessons,
  totalExercises,
}: ProgressPanelProps) {
  const completedExercises = Array.from(progress.values()).reduce(
    (sum, p) => sum + p.exercisesCompleted,
    0
  );

  const completedLessons = Array.from(progress.values()).filter(
    (p) => p.exercisesCompleted === p.exercisesTotal
  ).length;

  const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '2rem',
      }}
    >
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>📊 Tiến độ học tập</h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Tổng tiến độ</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6' }}>
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div
          style={{
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              width: `${overallProgress}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '0.25rem' }}>
            Bài học
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
            {completedLessons}/{totalLessons}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '0.25rem' }}>
            Bài tập
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
            {completedExercises}/{totalExercises}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            color: '#92400e',
            marginBottom: '0.5rem',
            fontWeight: 500,
          }}
        >
          🎯 Mục tiêu tiếp theo
        </div>
        <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
          {completedExercises === totalExercises
            ? 'Chúc mừng! Bạn đã hoàn thành tất cả bài tập!'
            : `Hoàn thành thêm ${totalExercises - completedExercises} bài tập`}
        </div>
      </div>
    </div>
  );
}

import type { Exercise } from '../content/types';

interface ExerciseViewProps {
  exercise: Exercise;
  onBack: () => void;
  onNextExercise?: () => void;
}

export default function ExerciseView({ exercise, onBack, onNextExercise }: ExerciseViewProps) {
  const difficultyColors = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '0.5rem',
          }}
          type="button"
          aria-label="Quay lại"
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>{exercise.title}</h2>
          <div
            style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.875rem' }}
          >
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                backgroundColor: `${difficultyColors[exercise.difficulty]}20`,
                color: difficultyColors[exercise.difficulty],
                fontWeight: 500,
              }}
            >
              {difficultyLabels[exercise.difficulty]}
            </span>
            {exercise.conceptTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  fontSize: '0.8rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {onNextExercise && (
          <button
            onClick={onNextExercise}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            type="button"
          >
            Bài tiếp →
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          style={{
            width: '40%',
            padding: '2rem',
            overflowY: 'auto',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        >
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>📋 Yêu cầu</h3>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
              }}
            >
              {exercise.instructions}
            </div>
          </section>

          <section>
            <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>💡 Gợi ý</h3>
            {exercise.hints.map((hint) => (
              <details
                key={hint}
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <summary style={{ fontWeight: 500, color: '#3b82f6' }}>
                  Gợi ý {exercise.hints.indexOf(hint) + 1}
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#475569', lineHeight: '1.6' }}>{hint}</p>
              </details>
            ))}
          </section>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#1e40af' }}>✏️ Code Editor</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Phase 2 sẽ tích hợp DartPad ở đây
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              minHeight: '400px',
            }}
          >
            {exercise.starterCode}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
              type="button"
            >
              ▶️ Run
            </button>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
              type="button"
            >
              ✓ Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

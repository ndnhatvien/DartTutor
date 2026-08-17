import { useState } from 'react';
import type { Exercise } from '../content/types';
import DartPadEmbed from './DartPadEmbed';

interface ExerciseViewProps {
  exercise: Exercise;
  onBack: () => void;
  onNextExercise?: () => void;
}

export default function ExerciseView({ exercise, onBack, onNextExercise }: ExerciseViewProps) {
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [compilationError, setCompilationError] = useState<string | null>(null);

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

  const handleConsoleOutput = (output: string) => {
    setConsoleMessages((prev) => [...prev, output]);
    setCompilationError(null);
  };

  const handleCompilationError = (error: string) => {
    setCompilationError(error);
    setConsoleMessages([]);
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
          </div>

          <DartPadEmbed
            initialCode={exercise.starterCode}
            testCode={exercise.testCode}
            onConsoleOutput={handleConsoleOutput}
            onCompilationError={handleCompilationError}
          />

          {compilationError && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>❌ Compilation Error:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                {compilationError}
              </pre>
            </div>
          )}

          {consoleMessages.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#166534',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>✓ Console Output:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {consoleMessages.map((msg, idx) => (
                  <div key={`msg-${idx}-${msg.slice(0, 20)}`} style={{ marginBottom: '0.25rem' }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

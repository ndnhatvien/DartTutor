import { useState } from 'react';
import type { Lesson } from '../content/types';
import DartPadEmbed from './DartPadEmbed';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartExercises: () => void;
}

export default function LessonView({ lesson, onBack, onStartExercises }: LessonViewProps) {
  const [selectedExampleId, setSelectedExampleId] = useState(lesson.examples[0]?.id);

  const selectedExample =
    lesson.examples.find((ex) => ex.id === selectedExampleId) ?? lesson.examples[0];

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
          <h2 style={{ margin: 0, color: '#1e293b' }}>{lesson.title}</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {lesson.description}
          </p>
        </div>
        <button
          onClick={onStartExercises}
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
          📝 Bắt đầu bài tập ({lesson.exercises.length})
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          style={{
            width: '45%',
            padding: '2rem',
            overflowY: 'auto',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        >
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>🎯 Mục tiêu</h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8', color: '#475569' }}>
              {lesson.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>📖 Lý thuyết</h3>
            {lesson.theory.map((section) => (
              <div
                key={section.title}
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{section.title}</h4>
                {section.content.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    style={{
                      margin: '0 0 0.5rem 0',
                      color: '#475569',
                      lineHeight: '1.7',
                      fontSize: '0.9rem',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </section>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>▶️ Ví dụ minh họa</h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {lesson.examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setSelectedExampleId(example.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border:
                    selectedExampleId === example.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  backgroundColor: selectedExampleId === example.id ? '#dbeafe' : 'white',
                  color: selectedExampleId === example.id ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: selectedExampleId === example.id ? 600 : 400,
                }}
                type="button"
              >
                {example.title}
              </button>
            ))}
          </div>

          {selectedExample && (
            <>
              <p
                style={{
                  margin: '0 0 1rem 0',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  color: '#1e3a8a',
                  fontSize: '0.9rem',
                }}
              >
                {selectedExample.description}
              </p>
              <DartPadEmbed
                initialCode={selectedExample.code}
                externalCode={selectedExample.code}
              />
            </>
          )}

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#065f46',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              📝 Đã nắm được lý thuyết và ví dụ chưa?
            </div>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>
              Hãy thử sức với {lesson.exercises.length} bài tập để vận dụng kiến thức vừa học.
            </p>
            <button
              onClick={onStartExercises}
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
              📝 Bắt đầu bài tập ({lesson.exercises.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

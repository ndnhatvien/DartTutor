import { Fragment, useState } from 'react';
import type { Lesson } from '../content/types';
import DartPadEmbed from './DartPadEmbed';
import { speakText, stopSpeaking } from './speech';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartExercises: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25];

const selectStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '0.3rem 0.4rem',
  fontSize: '0.75rem',
  color: '#64748b',
  background: 'white',
  cursor: 'pointer',
} as const;

function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speakText(text, () => setSpeaking(false), rate);
    setSpeaking(true);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
      <select
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        style={selectStyle}
        aria-label="Tốc độ đọc"
      >
        {SPEED_OPTIONS.map((speed) => (
          <option key={speed} value={speed}>
            {speed}x
          </option>
        ))}
      </select>
      <button
        onClick={toggle}
        style={{
          background: speaking ? '#fef3c7' : 'none',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '0.3rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          color: speaking ? '#92400e' : '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
        type="button"
      >
        {speaking ? '⏹ Dừng' : '🔊 Nghe đọc'}
      </button>
    </div>
  );
}

const codeChipStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: '0.8em',
  backgroundColor: '#eef2f7',
  color: '#be185d',
  padding: '0.15rem 0.35rem',
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

function renderInlineText(text: string) {
  const parts = text.split('`');
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <code key={`code-${idx}-${part.slice(0, 20)}`} style={codeChipStyle}>
        {part}
      </code>
    ) : (
      <Fragment key={`text-${idx}-${part.slice(0, 20)}`}>{part}</Fragment>
    )
  );
}

function renderTheoryParagraph(paragraph: string) {
  const trimmed = paragraph.trim();
  if (trimmed.startsWith('```')) {
    const code = trimmed
      .replace(/^```(dart)?\s*/, '')
      .replace(/```$/, '')
      .trim();
    return (
      <pre
        key={code.slice(0, 40)}
        style={{
          margin: '0 0 0.75rem 0',
          padding: '1rem',
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {code}
      </pre>
    );
  }
  return (
    <p
      key={paragraph.slice(0, 40)}
      style={{
        margin: '0 0 0.5rem 0',
        color: '#475569',
        lineHeight: '1.7',
        fontSize: '0.9rem',
      }}
    >
      {renderInlineText(paragraph)}
    </p>
  );
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h4 style={{ margin: 0, color: '#1e293b' }}>{section.title}</h4>
                  <SpeakButton
                    text={section.content.filter((c) => !c.trim().startsWith('```')).join('. ')}
                  />
                </div>
                {section.content.map((paragraph) => renderTheoryParagraph(paragraph))}
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
              <div
                style={{
                  margin: '0 0 1rem 0',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  color: '#1e3a8a',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{selectedExample.description}</span>
                <SpeakButton text={selectedExample.description} />
              </div>
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

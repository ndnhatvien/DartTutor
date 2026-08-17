import { useEffect, useRef, useState } from 'react';

interface DartPadEmbedProps {
  initialCode: string;
  testCode?: string;
  onReady?: () => void;
  onConsoleOutput?: (output: string) => void;
  onCompilationError?: (error: string) => void;
}

export default function DartPadEmbed({
  initialCode,
  testCode,
  onReady,
  onConsoleOutput,
  onCompilationError,
}: DartPadEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://dartpad.dev') return;

      try {
        const data = event.data;

        if (data.type === 'ready') {
          setIsReady(true);
          onReady?.();
        } else if (data.type === 'consoleOutput') {
          const output = data.message || '';
          setConsoleOutput((prev) => [...prev, output]);
          onConsoleOutput?.(output);
        } else if (data.type === 'compilationError') {
          onCompilationError?.(data.message || 'Compilation error');
        }
      } catch (error) {
        console.error('DartPad message parsing error:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onReady, onConsoleOutput, onCompilationError]);

  const runCode = () => {
    if (!isReady || !iframeRef.current?.contentWindow) {
      console.warn('DartPad not ready');
      return;
    }

    setConsoleOutput([]);
    iframeRef.current.contentWindow.postMessage(
      {
        command: 'execute',
        code: initialCode,
      },
      'https://dartpad.dev'
    );
  };

  const runTests = () => {
    if (!isReady || !iframeRef.current?.contentWindow || !testCode) {
      console.warn('DartPad not ready or no test code');
      return;
    }

    setConsoleOutput([]);
    iframeRef.current.contentWindow.postMessage(
      {
        command: 'execute',
        code: `${initialCode}\n\n${testCode}`,
      },
      'https://dartpad.dev'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <iframe
        ref={iframeRef}
        src="https://dartpad.dev/embed-inline.html?theme=dark&run=false"
        style={{
          width: '100%',
          flex: 1,
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          minHeight: '400px',
        }}
        title="DartPad Editor"
        sandbox="allow-scripts allow-same-origin"
      />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={runCode}
          disabled={!isReady}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isReady ? '#10b981' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isReady ? 'pointer' : 'not-allowed',
            fontWeight: 500,
          }}
          type="button"
        >
          ▶️ Run
        </button>

        {testCode && (
          <button
            onClick={runTests}
            disabled={!isReady}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isReady ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isReady ? 'pointer' : 'not-allowed',
              fontWeight: 500,
            }}
            type="button"
          >
            ✓ Test
          </button>
        )}
      </div>

      {consoleOutput.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#10b981' }}>
            Console Output:
          </div>
          {consoleOutput.map((line, idx) => (
            <div key={`console-${idx}-${line.slice(0, 20)}`} style={{ marginBottom: '0.25rem' }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {!isReady && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}
        >
          ⏳ Đang tải DartPad...
        </div>
      )}
    </div>
  );
}

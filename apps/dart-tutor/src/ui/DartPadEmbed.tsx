import { useCallback, useEffect, useRef, useState } from 'react';

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
  const lastCodeRef = useRef(initialCode);

  const sendCodeToDartPad = useCallback((code: string) => {
    if (!iframeRef.current?.contentWindow) return;
    lastCodeRef.current = code;
    setConsoleOutput([]);
    iframeRef.current.contentWindow.postMessage({ type: 'sourceCode', sourceCode: code }, '*');
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'ready') {
          setIsReady(true);
          onReady?.();
          sendCodeToDartPad(initialCode);
        } else if (data.type === 'consoleOutput') {
          const output = data.message || '';
          setConsoleOutput((prev) => [...prev, output]);
          onConsoleOutput?.(output);
        } else if (data.type === 'compilationResult') {
          if (data.success === false || data.error) {
            onCompilationError?.(data.error || data.message || 'Compilation error');
          }
        } else if (data.type === 'compilationError') {
          onCompilationError?.(data.message || 'Compilation error');
        } else if (data.type === 'message') {
          if (data.isError) {
            onCompilationError?.(data.message || 'Error');
          }
        }
      } catch (error) {
        console.error('DartPad message parsing error:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onReady, onConsoleOutput, onCompilationError, sendCodeToDartPad, initialCode]);

  const runCode = () => {
    sendCodeToDartPad(lastCodeRef.current);
  };

  const runTests = () => {
    if (!testCode) return;
    const combinedCode = `${lastCodeRef.current}\n\n${testCode}`;
    sendCodeToDartPad(combinedCode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <iframe
        ref={iframeRef}
        src="https://dartpad.dev/?embed=true&theme=dark&run=true"
        style={{
          width: '100%',
          flex: 1,
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          minHeight: '400px',
        }}
        title="DartPad Editor"
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

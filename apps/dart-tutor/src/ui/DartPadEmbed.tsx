import { useCallback, useEffect, useRef, useState } from 'react';

interface DartPadEmbedProps {
  initialCode: string;
  testCode?: string;
  onReady?: () => void;
  onConsoleOutput?: (output: string) => void;
  onCompilationError?: (error: string) => void;
}

function transformTestCode(raw: string): string {
  let code = raw;
  code = code.replace(/^import\s+'package:test\/test\.dart';\s*\n?/m, '');

  code = code.replace(/expect\(([^,]+),\s*equals\(([^)]+)\)\)/g, 'assert(($1) == ($2))');
  code = code.replace(/expect\(([^,]+),\s*isNull\)/g, 'assert(($1) == null)');
  code = code.replace(/expect\(([^,]+),\s*isNotNull\)/g, 'assert(($1) != null)');
  code = code.replace(/expect\(([^,]+),\s*isTrue\)/g, 'assert(($1) == true)');
  code = code.replace(/expect\(([^,]+),\s*isFalse\)/g, 'assert(($1) == false)');

  const tests: { name: string; body: string; async: boolean }[] = [];
  const testRegex = /test\(\s*'([^']+)'\s*,\s*\(\)\s*(async\s+)?\{/g;
  let match = testRegex.exec(code);
  while (match !== null) {
    const name = match[1] ?? 'unnamed test';
    const isAsync = match[2] != null;
    const bodyStart = match.index + match[0].length;
    let depth = 1;
    let j = bodyStart;
    while (j < code.length && depth > 0) {
      if (code[j] === '{') depth++;
      else if (code[j] === '}') depth--;
      j++;
    }
    const body = code.slice(bodyStart, j - 1).trim();
    tests.push({ name, body, async: isAsync });
    match = testRegex.exec(code);
  }

  if (tests.length === 0) return code;

  let result = '';
  for (const t of tests) {
    const lines = t.body.split('\n').filter((l) => l.trim());
    result += `  // ${t.name}\n  try {\n`;
    for (const line of lines) {
      result += `    ${line.trim()}\n`;
    }
    result += `    print('\\u2705 ${t.name}');\n`;
    result += `  } catch (e) {\n    print('\\u274c ${t.name}: \\$e');\n  }\n\n`;
  }
  return result.trimEnd();
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
    const userCode = lastCodeRef.current;
    const mainIdx = userCode.indexOf('\nvoid main(');
    const codeWithoutMain = mainIdx !== -1 ? userCode.substring(0, mainIdx) : userCode;
    const transformed = transformTestCode(testCode);
    const combinedCode = `${codeWithoutMain}\n\nvoid main() {\n${transformed}\n}`;
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

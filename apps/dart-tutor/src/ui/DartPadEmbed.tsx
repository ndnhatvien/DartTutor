import { useCallback, useEffect, useRef, useState } from 'react';

interface DartPadEmbedProps {
  initialCode: string;
  testCode?: string;
  externalCode?: string;
  onReady?: () => void;
  onTestsRun?: () => void;
  onConsoleOutput?: (output: string) => void;
  onCompilationError?: (error: string) => void;
}

function findClosingParen(s: string, start: number): number {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && (inSingle || inDouble)) {
      i++;
      continue;
    }
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (!inSingle && !inDouble) {
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

function replaceExpectations(code: string): string {
  let result = code;
  const marker = '\x00';
  const placeholders: string[] = [];
  let searchFrom = 0;

  while (true) {
    const idx = result.indexOf('expect(', searchFrom);
    if (idx === -1) break;
    const parenStart = idx + 6;
    const parenEnd = findClosingParen(result, parenStart);
    if (parenEnd === -1) {
      searchFrom = idx + 7;
      continue;
    }
    const inner = result.slice(parenStart + 1, parenEnd);
    const commaIdx = inner.indexOf(',');
    if (commaIdx === -1) {
      searchFrom = idx + 7;
      continue;
    }
    const actual = inner.slice(0, commaIdx).trim();
    const matcher = inner.slice(commaIdx + 1).trim();
    let replacement = '';

    if (matcher === 'isNull') {
      replacement = `assert((${actual}) == null)`;
    } else if (matcher === 'isNotNull') {
      replacement = `assert((${actual}) != null)`;
    } else if (matcher === 'isTrue') {
      replacement = `assert((${actual}) == true)`;
    } else if (matcher === 'isFalse') {
      replacement = `assert((${actual}) == false)`;
    } else if (matcher === 'isEmpty') {
      replacement = `assert((${actual}).isEmpty)`;
    } else if (matcher.startsWith('equals(')) {
      const eqOpen = matcher.indexOf('(');
      const eqEnd = findClosingParen(matcher, eqOpen);
      if (eqEnd !== -1) {
        const expected = matcher.slice(eqOpen + 1, eqEnd);
        replacement = `assert((${actual}) == (${expected}))`;
      }
    } else if (matcher.startsWith('contains(')) {
      const cOpen = matcher.indexOf('(');
      const cEnd = findClosingParen(matcher, cOpen);
      if (cEnd !== -1) {
        const expected = matcher.slice(cOpen + 1, cEnd);
        replacement = `assert((${actual}).toString().contains(${expected}))`;
      }
    } else if (matcher.startsWith('containsAll(')) {
      const cOpen = matcher.indexOf('(');
      const cEnd = findClosingParen(matcher, cOpen);
      if (cEnd !== -1) {
        const expected = matcher.slice(cOpen + 1, cEnd);
        replacement = `assert((${expected}).every((e) => (${actual}).contains(e)))`;
      }
    } else if (matcher.startsWith('isA<')) {
      const typeEnd = matcher.indexOf('>');
      if (typeEnd !== -1) {
        const type = matcher.slice(4, typeEnd);
        replacement = `assert((${actual}) is ${type})`;
      }
    } else if (matcher.startsWith('greaterThan(')) {
      const o = matcher.indexOf('(');
      const e = findClosingParen(matcher, o);
      if (e !== -1) {
        const expected = matcher.slice(o + 1, e);
        replacement = `assert((${actual}) > (${expected}))`;
      }
    } else if (matcher.startsWith('lessThan(')) {
      const o = matcher.indexOf('(');
      const e = findClosingParen(matcher, o);
      if (e !== -1) {
        const expected = matcher.slice(o + 1, e);
        replacement = `assert((${actual}) < (${expected}))`;
      }
    } else if (matcher.startsWith('closeTo(')) {
      const o = matcher.indexOf('(');
      const e = findClosingParen(matcher, o);
      if (e !== -1) {
        const args = matcher.slice(o + 1, e);
        const comma = args.indexOf(',');
        if (comma !== -1) {
          const value = args.slice(0, comma).trim();
          const delta = args.slice(comma + 1).trim();
          replacement = `assert(((${actual}) - (${value})).abs() <= (${delta}))`;
        }
      }
    } else if (matcher.startsWith('startsWith(')) {
      const o = matcher.indexOf('(');
      const e = findClosingParen(matcher, o);
      if (e !== -1) {
        const expected = matcher.slice(o + 1, e);
        replacement = `assert((${actual}).toString().startsWith(${expected}))`;
      }
    } else if (matcher === 'throwsException') {
      replacement = `try { ${actual}; assert(false, 'Expected exception'); } catch (_) {}`;
    } else if (matcher.startsWith('throwsA(')) {
      replacement = `try { ${actual}; assert(false, 'Expected exception'); } catch (_) {}`;
    } else {
      replacement = `assert((${actual}) == (${matcher}))`;
    }

    if (replacement) {
      const ph = `${marker}${placeholders.length}${marker}`;
      placeholders.push(replacement);
      result = result.slice(0, idx) + ph + result.slice(parenEnd + 1);
      searchFrom = idx + ph.length;
    } else {
      searchFrom = idx + 7;
    }
  }

  for (let i = 0; i < placeholders.length; i++) {
    result = result.replaceAll(`${marker}${i}${marker}`, placeholders[i] ?? '');
  }
  return result;
}

function transformTestCode(raw: string): { code: string; needsAsync: boolean } {
  let code = raw;
  code = code.replace(/^import\s+'package:test\/test\.dart';\s*\n?/m, '');
  code = replaceExpectations(code);

  const tests: { name: string; body: string }[] = [];
  const testRegex = /test\(\s*'([^']+)'\s*,\s*\(\)\s*(async\s+)?\{/g;
  let needsAsync = false;
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
    let body = code.slice(bodyStart, j - 1).trim();
    if (isAsync) {
      needsAsync = true;
      body = body.replace(/\bawait\b/g, 'await');
    }
    tests.push({ name, body });
    match = testRegex.exec(code);
  }

  if (tests.length === 0) return { code, needsAsync: false };

  let result = '';
  for (const t of tests) {
    const lines = t.body.split('\n').filter((l) => l.trim());
    const hasAwait = /\bawait\b/.test(t.body);
    if (hasAwait) needsAsync = true;
    result += `  // ${t.name}\n  try {\n`;
    for (const line of lines) {
      result += `    ${line.trim()}\n`;
    }
    result += `    print('\\u2705 ${t.name}');\n`;
    result += `  } catch (e) {\n    print('\\u274c ${t.name}: \\$e');\n  }\n\n`;
  }
  return { code: result.trimEnd(), needsAsync };
}

export default function DartPadEmbed({
  initialCode,
  testCode,
  externalCode,
  onReady,
  onTestsRun,
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

  useEffect(() => {
    if (externalCode && isReady) {
      sendCodeToDartPad(externalCode);
    }
  }, [externalCode, isReady, sendCodeToDartPad]);

  const runTests = () => {
    if (!testCode) return;
    const userCode = lastCodeRef.current;
    const mainIdx = userCode.indexOf('\nvoid main(');
    const codeWithoutMain = mainIdx !== -1 ? userCode.substring(0, mainIdx) : userCode;
    const { code: transformed, needsAsync } = transformTestCode(testCode);
    const fnPrefix = needsAsync ? 'async ' : '';
    const combinedCode = `${codeWithoutMain}\n\nvoid main() ${fnPrefix}{\n${transformed}\n}`;
    sendCodeToDartPad(combinedCode);
    onTestsRun?.();
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

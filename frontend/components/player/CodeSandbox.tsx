'use client';

import { useState, useRef } from 'react';
import { Play, RotateCcw, Lightbulb, Copy, Check } from 'lucide-react';
import api from '@/lib/axios';

interface Props {
  challenge?: string;
  starterCode?: string;
  lessonId?: string;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (key: string) => unknown };
}

export default function CodeSandbox({ challenge, starterCode, lessonId }: Props) {
  const [code, setCode] = useState(starterCode ?? '# Write your Python code here\nprint("Hello, Paython Academy!")\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loadingPyodide, setLoadingPyodide] = useState(false);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  const loadPyodide = async () => {
    if (pyodideRef.current) return;
    setLoadingPyodide(true);
    try {
      // Dynamically load Pyodide from CDN
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });
      pyodideRef.current = pyodide;
      setPyodideReady(true);
    } catch (err) {
      setOutput('Error: Failed to load Python runtime. Please try again.');
    } finally {
      setLoadingPyodide(false);
    }
  };

  const runCode = async () => {
    if (!pyodideRef.current) {
      await loadPyodide();
      if (!pyodideRef.current) return;
    }

    setIsRunning(true);
    setOutput('');

    try {
      const pyodide = pyodideRef.current;
      let outputLines: string[] = [];

      // Override print to capture output
      await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      try {
        await pyodide.runPythonAsync(code);
        const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()') as string;
        const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()') as string;
        outputLines = [];
        if (stdout) outputLines.push(stdout);
        if (stderr) outputLines.push(`⚠ ${stderr}`);
        if (!stdout && !stderr) outputLines.push('(no output)');
      } catch (err: unknown) {
        outputLines = [`❌ ${(err as Error).message}`];
      }

      // Reset stdout/stderr
      await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);

      setOutput(outputLines.join('\n'));
    } catch (err: unknown) {
      setOutput(`❌ Runtime error: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getHint = async () => {
    if (!lessonId || !challenge) return;
    setLoadingHint(true);
    try {
      const { data } = await api.post('/api/ai/hint', {
        code,
        challenge,
        error: output.includes('❌') ? output : undefined,
      });
      setHint(data.hint);
    } catch {
      setHint('Could not load hint. Please try again.');
    } finally {
      setLoadingHint(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-gray-400 text-xs font-mono ml-1">Python Sandbox</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => { setCode(starterCode ?? ''); setOutput(''); setHint(''); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={runCode}
            disabled={isRunning || loadingPyodide}
            className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
          >
            <Play size={12} />
            {loadingPyodide ? 'Loading Python...' : isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Challenge */}
      {challenge && (
        <div className="px-4 py-3 bg-brand-900/20 border-b border-brand-800/40">
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-wide mb-1">Challenge</p>
          <p className="text-gray-300 text-sm">{challenge}</p>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-gray-950 text-gray-100 font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed"
          style={{ minHeight: '220px', tabSize: 4 }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newCode = code.slice(0, start) + '    ' + code.slice(end);
              setCode(newCode);
              requestAnimationFrame(() => {
                e.currentTarget.selectionStart = start + 4;
                e.currentTarget.selectionEnd = start + 4;
              });
            }
          }}
        />
        {/* Line numbers overlay hint */}
        <div className="absolute top-2 right-2 text-xs text-gray-600 font-mono pointer-events-none">
          {!pyodideReady && !loadingPyodide && (
            <span
              className="cursor-pointer pointer-events-auto text-brand-500 hover:text-brand-400"
              onClick={loadPyodide}
            >
              Click Run to load Python ↗
            </span>
          )}
        </div>
      </div>

      {/* Output */}
      {(output || isRunning) && (
        <div className="border-t border-gray-700">
          <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Output</span>
            {output && (
              <button
                onClick={() => setOutput('')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="px-4 py-3 font-mono text-sm min-h-12 max-h-48 overflow-y-auto">
            {isRunning ? (
              <span className="text-gray-500 animate-pulse">Running...</span>
            ) : (
              <pre className={`whitespace-pre-wrap leading-relaxed ${
                output.includes('❌') ? 'text-red-400' : 'text-green-400'
              }`}>
                {output}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* AI Hint */}
      {(challenge && lessonId) && (
        <div className="border-t border-gray-700 px-4 py-3">
          {hint ? (
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3">
              <p className="text-amber-300 text-xs font-semibold mb-1 flex items-center gap-1">
                <Lightbulb size={12} /> Hint
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{hint}</p>
              <button
                onClick={() => setHint('')}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <button
              onClick={getHint}
              disabled={loadingHint}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-800/60 hover:border-amber-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Lightbulb size={13} />
              {loadingHint ? 'Getting hint...' : 'Get AI Hint'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

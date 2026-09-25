import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// ─── Bracket Analysis ────────────────────────────────────────────────
interface BracketInfo {
  openCount: number;
  closeCount: number;
  unclosed: number;       // how many '(' still need ')'
  extraClose: number;     // how many ')' have no matching '('
  isBalanced: boolean;
  // Per-character bracket status for coloring
  charStatus: Array<{ char: string; status: 'matched' | 'unclosed-open' | 'unclosed-close' | 'normal' }>;
}

function analyzeBrackets(expr: string): BracketInfo {
  const stack: number[] = []; // stores indices of unmatched '('
  const charStatus: BracketInfo['charStatus'] = [];
  const matchedOpen = new Set<number>();
  const matchedClose = new Set<number>();

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(') {
      stack.push(i);
      charStatus.push({ char: ch, status: 'unclosed-open' }); // tentative
    } else if (ch === ')') {
      if (stack.length > 0) {
        const openIdx = stack.pop()!;
        matchedOpen.add(openIdx);
        matchedClose.add(i);
        charStatus.push({ char: ch, status: 'matched' });
      } else {
        charStatus.push({ char: ch, status: 'unclosed-close' });
      }
    } else {
      charStatus.push({ char: ch, status: 'normal' });
    }
  }

  // Mark remaining unclosed opens
  for (const idx of stack) {
    charStatus[idx] = { char: '(', status: 'unclosed-open' };
  }

  const openCount = expr.split('').filter(c => c === '(').length;
  const closeCount = expr.split('').filter(c => c === ')').length;
  const unclosed = stack.length;
  const extraClose = closeCount - matchedClose.size;

  return {
    openCount,
    closeCount,
    unclosed,
    extraClose,
    isBalanced: unclosed === 0 && extraClose === 0,
    charStatus,
  };
}

// ─── Expression Evaluator ────────────────────────────────────────────
function evaluateExpression(expr: string): { result: string; error: string | null } {
  try {
    if (expr.trim() === '') return { result: '', error: null };

    // Check bracket balance first
    const bracketInfo = analyzeBrackets(expr);
    if (!bracketInfo.isBalanced) {
      if (bracketInfo.unclosed > 0) {
        return { result: '', error: `Missing ${bracketInfo.unclosed} closing bracket${bracketInfo.unclosed > 1 ? 's' : ''} ')'` };
      }
      if (bracketInfo.extraClose > 0) {
        return { result: '', error: `${bracketInfo.extraClose} extra closing bracket${bracketInfo.extraClose > 1 ? 's' : ''} ')'` };
      }
    }

    let processed = expr
      .replace(/π/g, String(Math.PI))
      .replace(/\bpi\b/g, String(Math.PI))
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, String(Math.E))
      .replace(/\basin\b/g, 'Math.asin')
      .replace(/\bacos\b/g, 'Math.acos')
      .replace(/\batan\b/g, 'Math.atan')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\^/g, '**');

    // Handle factorial
    processed = processed.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => {
      const num = parseFloat(n);
      if (num < 0 || num !== Math.floor(num)) return 'NaN';
      if (num > 170) return 'Infinity';
      let result = 1;
      for (let i = 2; i <= num; i++) result *= i;
      return String(result);
    });

    const result = new Function(`"use strict"; return (${processed})`)();

    if (typeof result !== 'number') return { result: '', error: 'Invalid result' };
    if (!isFinite(result) && !isNaN(result)) return { result: '', error: 'Result is Infinity (overflow)' };
    if (isNaN(result)) return { result: '', error: 'Result is NaN (undefined)' };

    if (Number.isInteger(result) && Math.abs(result) < 1e15) {
      return { result: result.toString(), error: null };
    }
    return { result: parseFloat(result.toPrecision(12)).toString(), error: null };
  } catch {
    return { result: '', error: 'Syntax error in expression' };
  }
}

// ─── Colored Display Component ───────────────────────────────────────
function ColoredExpression({ expr }: { expr: string }) {
  const bracketInfo = useMemo(() => analyzeBrackets(expr), [expr]);

  if (!expr) return <span className="text-gray-500">0</span>;

  return (
    <>
      {bracketInfo.charStatus.map((item, i) => {
        let className = '';
        switch (item.status) {
          case 'matched':
            className = 'text-green-400';
            break;
          case 'unclosed-open':
            className = 'text-red-400 animate-pulse';
            break;
          case 'unclosed-close':
            className = 'text-orange-400 animate-pulse';
            break;
          default:
            className = 'text-white';
        }
        return (
          <span key={i} className={className}>
            {item.char}
          </span>
        );
      })}
    </>
  );
}

// ─── Bracket Status Bar ──────────────────────────────────────────────
function BracketStatusBar({ bracketInfo }: { bracketInfo: BracketInfo }) {
  if (bracketInfo.openCount === 0 && bracketInfo.closeCount === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs mt-2 flex-wrap">
      {/* Open brackets */}
      <div className="flex items-center gap-1">
        <span className="text-gray-500">(</span>
        <span className={`font-bold ${bracketInfo.unclosed > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {bracketInfo.openCount}
        </span>
        <span className="text-gray-500">opened</span>
      </div>

      <span className="text-gray-600">|</span>

      {/* Close brackets */}
      <div className="flex items-center gap-1">
        <span className="text-gray-500">)</span>
        <span className={`font-bold ${bracketInfo.extraClose > 0 ? 'text-orange-400' : 'text-green-400'}`}>
          {bracketInfo.closeCount}
        </span>
        <span className="text-gray-500">closed</span>
      </div>

      <span className="text-gray-600">|</span>

      {/* Status indicator */}
      {bracketInfo.isBalanced ? (
        <span className="flex items-center gap-1 text-green-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
          Balanced ✓
        </span>
      ) : bracketInfo.unclosed > 0 ? (
        <span className="flex items-center gap-1 text-red-400">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
          Need {bracketInfo.unclosed} more <span className="font-mono font-bold">)</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-orange-400">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          {bracketInfo.extraClose} extra <span className="font-mono font-bold">)</span>
        </span>
      )}

      {/* Visual bracket stack */}
      {bracketInfo.unclosed > 0 && (
        <div className="flex gap-0.5 ml-1">
          {Array.from({ length: Math.min(bracketInfo.unclosed, 10) }).map((_, i) => (
            <span
              key={i}
              className="inline-block w-2 h-4 bg-red-500/60 rounded-sm border border-red-400/50"
              title={`Unclosed bracket #${i + 1}`}
            />
          ))}
          {bracketInfo.unclosed > 10 && (
            <span className="text-red-400 text-xs ml-1">+{bracketInfo.unclosed - 10}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Calculator Component ───────────────────────────────────────
export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState<Array<{ expr: string; result: string; isError: boolean }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [autoClose, setAutoClose] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showResultPreview, setShowResultPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const bracketInfo = useMemo(() => analyzeBrackets(display), [display]);

  // Live preview of result
  const livePreview = useMemo(() => {
    if (display.trim() === '' || !bracketInfo.isBalanced) return null;
    const { result, error } = evaluateExpression(display);
    if (error) return null;
    if (result === display) return null; // Don't show if it's the same
    return result;
  }, [display, bracketInfo.isBalanced]);

  const handleInput = useCallback((value: string) => {
    setLastError(null);
    setDisplay(prev => {
      let newExpr = prev + value;
      // Auto-close: if user types a function like sin(, auto-add )
      if (autoClose && /^(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs)\($/.test(value)) {
        // Don't auto-close here, let user close manually but show hint
      }
      return newExpr;
    });
  }, [autoClose]);

  const handleClear = useCallback(() => {
    setDisplay('');
    setLastError(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay(prev => {
      // If last chars form a function name + '(', remove whole function
      const funcPatterns = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'sqrt(', 'abs('];
      for (const fn of funcPatterns) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
    setLastError(null);
  }, []);

  const handleEvaluate = useCallback(() => {
    if (display.trim() === '') return;
    
    const { result, error } = evaluateExpression(display);
    
    if (error) {
      setLastError(error);
      return;
    }
    
    setLastError(null);
    setHistory(prev => [{ expr: display, result, isError: false }, ...prev.slice(0, 49)]);
    setDisplay(result);
  }, [display]);

  const handleAutoCloseBrackets = useCallback(() => {
    setDisplay(prev => {
      const info = analyzeBrackets(prev);
      if (info.unclosed > 0) {
        return prev + ')'.repeat(info.unclosed);
      }
      return prev;
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      else if (e.key === '.') handleInput('.');
      else if (e.key === '+') handleInput('+');
      else if (e.key === '-') handleInput('-');
      else if (e.key === '*') handleInput('*');
      else if (e.key === '/') { e.preventDefault(); handleInput('/'); }
      else if (e.key === '^') handleInput('^');
      else if (e.key === '(') handleInput('(');
      else if (e.key === ')') handleInput(')');
      else if (e.key === '!') handleInput('!');
      else if (e.key === 'Enter' || e.key === '=') handleEvaluate();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEvaluate, handleBackspace, handleClear]);

  const buttons = [
    // Row 1: Scientific functions
    { label: 'sin(', value: 'sin(', class: 'func' },
    { label: 'cos(', value: 'cos(', class: 'func' },
    { label: 'tan(', value: 'tan(', class: 'func' },
    { label: 'π', value: 'pi', class: 'const' },
    { label: 'asin(', value: 'asin(', class: 'func' },
    { label: 'acos(', value: 'acos(', class: 'func' },
    { label: 'atan(', value: 'atan(', class: 'func' },
    { label: 'e', value: 'e', class: 'const' },
    // Row 2: More functions
    { label: 'log(', value: 'log(', class: 'func' },
    { label: 'ln(', value: 'ln(', class: 'func' },
    { label: 'sqrt(', value: 'sqrt(', class: 'func' },
    { label: 'abs(', value: 'abs(', class: 'func' },
    // Row 3: Main pad
    { label: '7', value: '7', class: 'num' },
    { label: '8', value: '8', class: 'num' },
    { label: '9', value: '9', class: 'num' },
    { label: '÷', value: '/', class: 'op' },
    { label: '4', value: '4', class: 'num' },
    { label: '5', value: '5', class: 'num' },
    { label: '6', value: '6', class: 'num' },
    { label: '×', value: '*', class: 'op' },
    { label: '1', value: '1', class: 'num' },
    { label: '2', value: '2', class: 'num' },
    { label: '3', value: '3', class: 'num' },
    { label: '−', value: '-', class: 'op' },
    { label: '(', value: '(', class: 'paren-open' },
    { label: '0', value: '0', class: 'num' },
    { label: ')', value: ')', class: 'paren-close' },
    { label: '+', value: '+', class: 'op' },
    // Row 4: Control
    { label: '^', value: '^', class: 'op' },
    { label: '.', value: '.', class: 'num' },
    { label: '!', value: '!', class: 'op' },
    { label: '⌫', value: '', class: 'backspace', action: handleBackspace },
    { label: 'C', value: '', class: 'clear', action: handleClear },
    { label: 'ANS', value: '', class: 'special', action: () => {
      if (history.length > 0 && !history[0].isError) setDisplay(history[0].result);
    }},
    { label: ')×', value: '', class: 'autoclose', action: handleAutoCloseBrackets },
    { label: '=', value: '', class: 'equals', action: handleEvaluate },
  ];

  const getButtonClass = (btn: typeof buttons[0]) => {
    const base = "rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 shadow-md ";
    switch (btn.class) {
      case 'num': return base + 'bg-gray-700 hover:bg-gray-600 text-white';
      case 'op': return base + 'bg-amber-600 hover:bg-amber-500 text-white';
      case 'func': return base + 'bg-indigo-700 hover:bg-indigo-600 text-indigo-100 text-xs';
      case 'const': return base + 'bg-purple-700 hover:bg-purple-600 text-white';
      case 'paren-open': return base + `border-2 ${bracketInfo.unclosed > 0 ? 'border-green-500 bg-green-900/40 text-green-300' : 'border-gray-600 bg-gray-600 hover:bg-gray-500 text-white'}`;
      case 'paren-close': return base + `border-2 ${bracketInfo.extraClose > 0 ? 'border-orange-500 bg-orange-900/40 text-orange-300' : bracketInfo.unclosed > 0 ? 'border-green-500 bg-green-900/40 text-green-300' : 'border-gray-600 bg-gray-600 hover:bg-gray-500 text-white'}`;
      case 'clear': return base + 'bg-red-700 hover:bg-red-600 text-white';
      case 'backspace': return base + 'bg-orange-700 hover:bg-orange-600 text-white';
      case 'equals': return base + 'bg-green-600 hover:bg-green-500 text-white text-lg';
      case 'special': return base + 'bg-teal-700 hover:bg-teal-600 text-white';
      case 'autoclose': return base + 'bg-cyan-700 hover:bg-cyan-600 text-white text-xs';
      default: return base + 'bg-gray-700 hover:bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Calculator body */}
      <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 w-full max-w-lg">
        
        {/* Display area */}
        <div className={`rounded-xl p-4 mb-3 border-2 transition-colors duration-300 ${
          lastError ? 'bg-red-950/30 border-red-700' :
          bracketInfo.isBalanced ? 'bg-gray-950 border-gray-700' :
          'bg-orange-950/20 border-orange-700/50'
        }`}>
          {/* Previous expression */}
          <div className="text-gray-500 text-xs h-5 overflow-hidden text-right font-mono">
            {history.length > 0 && `${history[0].expr} =`}
          </div>
          
          {/* Main expression with colored brackets */}
          <div className="text-xl font-mono text-right min-h-[2rem] overflow-x-auto whitespace-nowrap scrollbar-thin">
            <ColoredExpression expr={display} />
          </div>

          {/* Live preview */}
          {livePreview && !lastError && display !== livePreview && (
            <div className="text-right mt-1">
              <span className="text-gray-500 text-xs">= </span>
              <span className="text-green-400/70 text-sm font-mono">{livePreview}</span>
            </div>
          )}

          {/* Error message */}
          {lastError && (
            <div className="text-right mt-1">
              <span className="text-red-400 text-xs font-medium">⚠ {lastError}</span>
            </div>
          )}

          {/* Bracket status bar */}
          <BracketStatusBar bracketInfo={bracketInfo} />
        </div>

        {/* Settings row */}
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoClose}
              onChange={(e) => setAutoClose(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-cyan-500"
            />
            <span className="text-gray-400 text-xs">Smart backspace</span>
          </label>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-gray-400 text-xs hover:text-white transition-colors flex items-center gap-1"
          >
            <span>{showHistory ? '▼' : '▶'}</span>
            History {history.length > 0 && `(${history.length})`}
          </button>
        </div>

        {/* History panel */}
        {showHistory && (
          <div className="bg-gray-950 rounded-lg p-2 mb-3 max-h-40 overflow-y-auto border border-gray-700 animate-fade-in">
            {history.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-2">No history yet</p>
            ) : (
              history.map((item, i) => (
                <div
                  key={i}
                  className="text-xs py-1.5 px-2 border-b border-gray-800 last:border-0 flex justify-between items-center hover:bg-gray-800/50 rounded cursor-pointer"
                  onClick={() => { setDisplay(item.expr); setLastError(null); }}
                >
                  <span className="text-gray-400 font-mono truncate mr-2">{item.expr}</span>
                  <span className={`font-mono font-bold shrink-0 ${item.isError ? 'text-red-400' : 'text-green-400'}`}>
                    = {item.result}
                  </span>
                </div>
              ))
            )}
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-red-400/60 text-xs mt-2 hover:text-red-400 transition-colors w-full text-center"
              >
                Clear history
              </button>
            )}
          </div>
        )}

        {/* Button grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => {
                if (btn.action) {
                  btn.action();
                } else {
                  handleInput(btn.value);
                }
              }}
              className={`${getButtonClass(btn)} py-2.5`}
              title={btn.class === 'autoclose' ? 'Auto-close all open brackets' : ''}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <p className="text-gray-600 text-xs text-center mt-3">
          ⌨ Keyboard supported: 0-9, +, -, *, /, ^, (, ), Enter, Backspace, Esc
        </p>
      </div>

      {/* Expression examples */}
      <div className="text-center w-full max-w-lg">
        <p className="text-gray-400 text-sm mb-2">Try these expressions:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { expr: 'sin(pi/2)', desc: '= 1' },
            { expr: 'sqrt(144)', desc: '= 12' },
            { expr: '2^10', desc: '= 1024' },
            { expr: '5!', desc: '= 120' },
            { expr: 'log(1000)', desc: '= 3' },
            { expr: 'cos(pi)+1', desc: '= 0' },
            { expr: 'sin(pi/4)^2+cos(pi/4)^2', desc: '= 1' },
            { expr: 'sqrt(3^2+4^2)', desc: '= 5' },
          ].map(item => (
            <button
              key={item.expr}
              onClick={() => { setDisplay(item.expr); setLastError(null); }}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-600 transition-colors group"
              title={item.desc}
            >
              <span className="font-mono">{item.expr}</span>
              <span className="text-green-500/60 ml-1 group-hover:text-green-400">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bracket color legend */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 w-full max-w-lg">
        <h3 className="text-gray-300 text-sm font-bold mb-3">🎨 Bracket Color Legend</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-lg font-bold">( )</span>
            <span className="text-gray-400">Matched / Balanced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-mono text-lg font-bold animate-pulse">(</span>
            <span className="text-gray-400">Unclosed (needs ')' )</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 font-mono text-lg font-bold animate-pulse">)</span>
            <span className="text-gray-400">Extra (no matching '(' )</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex gap-0.5">
              {[1,2,3].map(i => (
                <span key={i} className="inline-block w-2 h-3 bg-red-500/60 rounded-sm border border-red-400/50"></span>
              ))}
            </span>
            <span className="text-gray-400">Visual stack (unclosed count)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            💡 <strong className="text-gray-400">Tip:</strong> The <span className="text-cyan-400 font-bold">)×</span> button auto-closes all unclosed brackets. 
            The <span className="text-green-400 font-bold">(</span> and <span className="text-green-400 font-bold">)</span> buttons change color to show bracket status.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// ─── Bracket Analysis ────────────────────────────────────────────────
interface BracketInfo {
  openCount: number;
  closeCount: number;
  unclosed: number;
  extraClose: number;
  isBalanced: boolean;
  charStatus: Array<{ char: string; status: 'matched' | 'unclosed-open' | 'unclosed-close' | 'normal' }>;
}

function analyzeBrackets(expr: string): BracketInfo {
  const stack: number[] = [];
  const charStatus: BracketInfo['charStatus'] = [];
  const matchedOpen = new Set<number>();
  const matchedClose = new Set<number>();

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(') {
      stack.push(i);
      charStatus.push({ char: ch, status: 'unclosed-open' });
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

// ─── Step-by-Step Evaluation ─────────────────────────────────────────
interface CalcStep {
  description: string;
  expression: string;
  result: string;
  highlight?: string; // Part being evaluated
}

function evaluateWithSteps(expr: string): { steps: CalcStep[]; finalResult: string; error: string | null } {
  const steps: CalcStep[] = [];
  
  try {
    if (expr.trim() === '') return { steps: [], finalResult: '', error: null };

    const bracketInfo = analyzeBrackets(expr);
    if (!bracketInfo.isBalanced) {
      if (bracketInfo.unclosed > 0) {
        return { steps: [], finalResult: '', error: `Missing ${bracketInfo.unclosed} closing bracket${bracketInfo.unclosed > 1 ? 's' : ''}` };
      }
      return { steps: [], finalResult: '', error: `${bracketInfo.extraClose} extra closing bracket${bracketInfo.extraClose > 1 ? 's' : ''}` };
    }

    let current = expr;
    
    // Step 1: Show original expression
    steps.push({
      description: 'Original expression',
      expression: current,
      result: current,
    });

    // Step 2: Evaluate functions and constants
    const funcPattern = /(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs)\(([^()]+)\)/g;
    let match;
    let hasFunctions = false;
    
    while ((match = funcPattern.exec(current)) !== null) {
      hasFunctions = true;
      const funcName = match[1];
      const arg = match[2];
      
      let processed = current
        .replace(/π/g, String(Math.PI))
        .replace(/\bpi\b/g, String(Math.PI))
        .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, String(Math.E));
      
      const argEval = new Function(`"use strict"; return (${arg.replace(/π/g, String(Math.PI)).replace(/\bpi\b/g, String(Math.PI)).replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, String(Math.E))})`)();
      
      let funcResult: number;
      switch (funcName) {
        case 'sin': funcResult = Math.sin(argEval); break;
        case 'cos': funcResult = Math.cos(argEval); break;
        case 'tan': funcResult = Math.tan(argEval); break;
        case 'asin': funcResult = Math.asin(argEval); break;
        case 'acos': funcResult = Math.acos(argEval); break;
        case 'atan': funcResult = Math.atan(argEval); break;
        case 'log': funcResult = Math.log10(argEval); break;
        case 'ln': funcResult = Math.log(argEval); break;
        case 'sqrt': funcResult = Math.sqrt(argEval); break;
        case 'abs': funcResult = Math.abs(argEval); break;
        default: funcResult = 0;
      }
      
      const resultStr = Number.isInteger(funcResult) ? funcResult.toString() : parseFloat(funcResult.toPrecision(6)).toString();
      
      steps.push({
        description: `Evaluate ${funcName}(${arg})`,
        expression: match[0],
        result: resultStr,
        highlight: match[0],
      });
      
      current = current.replace(match[0], resultStr);
    }

    // Replace constants
    if (current.includes('pi') || current.includes('π')) {
      steps.push({
        description: 'Replace π constant',
        expression: 'π',
        result: Math.PI.toFixed(6),
        highlight: 'π',
      });
      current = current.replace(/π/g, String(Math.PI)).replace(/\bpi\b/g, String(Math.PI));
    }
    
    if (/(?<![a-zA-Z])e(?![a-zA-Z])/.test(current)) {
      steps.push({
        description: 'Replace e constant',
        expression: 'e',
        result: Math.E.toFixed(6),
        highlight: 'e',
      });
      current = current.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, String(Math.E));
    }

    // Step 3: Evaluate factorials
    const factorialPattern = /(\d+)!/g;
    while ((match = factorialPattern.exec(current)) !== null) {
      const num = parseInt(match[1]);
      let factorial = 1;
      for (let i = 2; i <= num; i++) factorial *= i;
      
      steps.push({
        description: `Evaluate ${num}!`,
        expression: `${num}!`,
        result: factorial.toString(),
        highlight: `${num}!`,
      });
      
      current = current.replace(match[0], factorial.toString());
    }

    // Step 4: Evaluate powers
    const powerPattern = /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g;
    while ((match = powerPattern.exec(current)) !== null) {
      const base = parseFloat(match[1]);
      const exp = parseFloat(match[2]);
      const result = Math.pow(base, exp);
      const resultStr = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(6)).toString();
      
      steps.push({
        description: `Evaluate ${match[1]}^${match[2]}`,
        expression: match[0],
        result: resultStr,
        highlight: match[0],
      });
      
      current = current.replace(match[0], resultStr);
    }

    // Step 5: Evaluate multiplication/division (left to right)
    const mulDivPattern = /(\d+(?:\.\d+)?)\s*([*/])\s*(\d+(?:\.\d+)?)/;
    while ((match = current.match(mulDivPattern)) !== null) {
      const left = parseFloat(match[1]);
      const op = match[2];
      const right = parseFloat(match[3]);
      const result = op === '*' ? left * right : left / right;
      const resultStr = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(6)).toString();
      
      steps.push({
        description: `Evaluate ${match[1]} ${op} ${match[3]}`,
        expression: match[0],
        result: resultStr,
        highlight: match[0],
      });
      
      current = current.replace(match[0], resultStr);
    }

    // Step 6: Evaluate addition/subtraction (left to right)
    const addSubPattern = /(\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)/;
    while ((match = current.match(addSubPattern)) !== null) {
      const left = parseFloat(match[1]);
      const op = match[2];
      const right = parseFloat(match[3]);
      const result = op === '+' ? left + right : left - right;
      const resultStr = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(6)).toString();
      
      steps.push({
        description: `Evaluate ${match[1]} ${op} ${match[3]}`,
        expression: match[0],
        result: resultStr,
        highlight: match[0],
      });
      
      current = current.replace(match[0], resultStr);
    }

    // Final result
    const finalResult = current.trim();
    steps.push({
      description: 'Final result',
      expression: expr,
      result: finalResult,
    });

    return { steps, finalResult, error: null };
  } catch {
    return { steps, finalResult: '', error: 'Calculation error' };
  }
}

// ─── Expression Evaluator ────────────────────────────────────────────
function evaluateExpression(expr: string): { result: string; error: string | null } {
  try {
    if (expr.trim() === '') return { result: '', error: null };

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
      <div className="flex items-center gap-1">
        <span className="text-gray-500">(</span>
        <span className={`font-bold ${bracketInfo.unclosed > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {bracketInfo.openCount}
        </span>
        <span className="text-gray-500">opened</span>
      </div>

      <span className="text-gray-600">|</span>

      <div className="flex items-center gap-1">
        <span className="text-gray-500">)</span>
        <span className={`font-bold ${bracketInfo.extraClose > 0 ? 'text-orange-400' : 'text-green-400'}`}>
          {bracketInfo.closeCount}
        </span>
        <span className="text-gray-500">closed</span>
      </div>

      <span className="text-gray-600">|</span>

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

// ─── Calculation Steps Display ───────────────────────────────────────
function CalculationSteps({ steps, isVisible }: { steps: CalcStep[]; isVisible: boolean }) {
  if (!isVisible || steps.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-sm rounded-xl p-4 overflow-y-auto animate-fade-in z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-indigo-400 font-bold text-sm">📊 Calculation Steps</h3>
        <span className="text-gray-500 text-xs">{steps.length} steps</span>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`bg-gray-900 rounded-lg p-3 border-l-4 ${
              i === steps.length - 1 ? 'border-green-500' : 'border-indigo-500'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-mono text-xs font-bold shrink-0">
                {i + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs mb-1">{step.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-mono text-sm bg-gray-800 px-2 py-0.5 rounded">
                    {step.expression}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className={`font-mono text-sm font-bold ${
                    i === steps.length - 1 ? 'text-green-400' : 'text-cyan-400'
                  }`}>
                    {step.result}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const [showSteps, setShowSteps] = useState(false);
  const [calcSteps, setCalcSteps] = useState<CalcStep[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const bracketInfo = useMemo(() => analyzeBrackets(display), [display]);

  const livePreview = useMemo(() => {
    if (display.trim() === '' || !bracketInfo.isBalanced) return null;
    const { result, error } = evaluateExpression(display);
    if (error) return null;
    if (result === display) return null;
    return result;
  }, [display, bracketInfo.isBalanced]);

  const handleInput = useCallback((value: string) => {
    setLastError(null);
    setDisplay(prev => prev + value);
  }, []);

  const handleClear = useCallback(() => {
    setDisplay('');
    setLastError(null);
    setShowSteps(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay(prev => {
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
    
    // Generate calculation steps
    const { steps } = evaluateWithSteps(display);
    setCalcSteps(steps);
    setShowSteps(true);
    
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
    { label: 'sin(', value: 'sin(', class: 'func' },
    { label: 'cos(', value: 'cos(', class: 'func' },
    { label: 'tan(', value: 'tan(', class: 'func' },
    { label: 'π', value: 'pi', class: 'const' },
    { label: 'asin(', value: 'asin(', class: 'func' },
    { label: 'acos(', value: 'acos(', class: 'func' },
    { label: 'atan(', value: 'atan(', class: 'func' },
    { label: 'e', value: 'e', class: 'const' },
    { label: 'log(', value: 'log(', class: 'func' },
    { label: 'ln(', value: 'ln(', class: 'func' },
    { label: 'sqrt(', value: 'sqrt(', class: 'func' },
    { label: 'abs(', value: 'abs(', class: 'func' },
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
      <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 w-full max-w-lg">
        
        {/* Display area with relative positioning for overlay */}
        <div className={`relative rounded-xl p-4 mb-3 border-2 transition-colors duration-300 ${
          lastError ? 'bg-red-950/30 border-red-700' :
          bracketInfo.isBalanced ? 'bg-gray-950 border-gray-700' :
          'bg-orange-950/20 border-orange-700/50'
        }`}>
          {/* Calculation Steps Overlay */}
          <CalculationSteps steps={calcSteps} isVisible={showSteps} />
          
          {/* Main display content (hidden when steps are shown) */}
          <div className={!showSteps ? '' : 'opacity-30'}>
            <div className="text-gray-500 text-xs h-5 overflow-hidden text-right font-mono">
              {history.length > 0 && `${history[0].expr} =`}
            </div>
            
            <div className="text-xl font-mono text-right min-h-[2rem] overflow-x-auto whitespace-nowrap scrollbar-thin">
              <ColoredExpression expr={display} />
            </div>

            {livePreview && !lastError && display !== livePreview && (
              <div className="text-right mt-1">
                <span className="text-gray-500 text-xs">= </span>
                <span className="text-green-400/70 text-sm font-mono">{livePreview}</span>
              </div>
            )}

            {lastError && (
              <div className="text-right mt-1">
                <span className="text-red-400 text-xs font-medium">⚠ {lastError}</span>
              </div>
            )}

            <BracketStatusBar bracketInfo={bracketInfo} />
          </div>
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
          
          <div className="flex items-center gap-3">
            {showSteps && (
              <button
                onClick={() => setShowSteps(false)}
                className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
              >
                ✕ Hide Steps
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-400 text-xs hover:text-white transition-colors flex items-center gap-1"
            >
              <span>{showHistory ? '▼' : '▶'}</span>
              History {history.length > 0 && `(${history.length})`}
            </button>
          </div>
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
                  onClick={() => { setDisplay(item.expr); setLastError(null); setShowSteps(false); }}
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
                setShowSteps(false);
              }}
              className={`${getButtonClass(btn)} py-2.5`}
              title={btn.class === 'autoclose' ? 'Auto-close all open brackets' : ''}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <p className="text-gray-600 text-xs text-center mt-3">
          ⌨ Keyboard: 0-9, +, -, *, /, ^, (, ), Enter, Backspace, Esc
        </p>
      </div>

      {/* Expression examples */}
      <div className="text-center w-full max-w-lg">
        <p className="text-gray-400 text-sm mb-2">Try these expressions (click = to see steps):</p>
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
              onClick={() => { setDisplay(item.expr); setLastError(null); setShowSteps(false); }}
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
        <h3 className="text-gray-300 text-sm font-bold mb-3">🎨 Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h4 className="text-green-400 font-semibold mb-1">Bracket Colors</h4>
            <ul className="text-gray-400 space-y-1">
              <li><span className="text-green-400 font-mono">( )</span> = Matched</li>
              <li><span className="text-red-400 font-mono animate-pulse">(</span> = Unclosed</li>
              <li><span className="text-orange-400 font-mono animate-pulse">)</span> = Extra</li>
            </ul>
          </div>
          <div>
            <h4 className="text-indigo-400 font-semibold mb-1">Calculation Steps</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Shows order of operations</li>
              <li>• Displays intermediate results</li>
              <li>• Appears after pressing =</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

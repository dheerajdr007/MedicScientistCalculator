import { useState, useCallback } from 'react';

// Simple expression evaluator for the web calculator
function evaluateExpression(expr: string): string {
  try {
    // Replace mathematical functions and constants
    let processed = expr
      .replace(/π/g, String(Math.PI))
      .replace(/\bpi\b/g, String(Math.PI))
      .replace(/\be\b/g, String(Math.E))
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\basin\b/g, 'Math.asin')
      .replace(/\bacos\b/g, 'Math.acos')
      .replace(/\batan\b/g, 'Math.atan')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\^/g, '**');
    
    // Handle factorial
    processed = processed.replace(/(\d+)!/g, (_, n) => {
      let result = 1;
      for (let i = 2; i <= parseInt(n); i++) result *= i;
      return String(result);
    });
    
    // Evaluate safely
    const result = new Function(`"use strict"; return (${processed})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return 'Error: Invalid result';
    }
    
    // Format result
    if (Number.isInteger(result) && Math.abs(result) < 1e15) {
      return result.toString();
    }
    return parseFloat(result.toPrecision(10)).toString();
  } catch (e) {
    return 'Error: Invalid expression';
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleInput = useCallback((value: string) => {
    setDisplay(prev => prev + value);
  }, []);

  const handleClear = useCallback(() => {
    setDisplay('');
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay(prev => prev.slice(0, -1));
  }, []);

  const handleEvaluate = useCallback(() => {
    if (display.trim() === '') return;
    const result = evaluateExpression(display);
    setHistory(prev => [{ expr: display, result }, ...prev.slice(0, 19)]);
    setDisplay(result);
  }, [display]);

  const buttons = [
    { label: 'sin(', value: 'sin(', class: 'func' },
    { label: 'cos(', value: 'cos(', class: 'func' },
    { label: 'tan(', value: 'tan(', class: 'func' },
    { label: 'log(', value: 'log(', class: 'func' },
    { label: 'ln(', value: 'ln(', class: 'func' },
    { label: 'sqrt(', value: 'sqrt(', class: 'func' },
    { label: 'π', value: 'pi', class: 'const' },
    { label: 'e', value: 'e', class: 'const' },
    { label: '^', value: '^', class: 'op' },
    { label: '(', value: '(', class: 'paren' },
    { label: ')', value: ')', class: 'paren' },
    { label: '!', value: '!', class: 'op' },
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
    { label: '0', value: '0', class: 'num' },
    { label: '.', value: '.', class: 'num' },
    { label: 'ANS', value: '', class: 'special', action: () => {
      if (history.length > 0) setDisplay(history[0].result);
    }},
    { label: '+', value: '+', class: 'op' },
    { label: 'C', value: '', class: 'clear', action: handleClear },
    { label: '⌫', value: '', class: 'clear', action: handleBackspace },
    { label: '=', value: '', class: 'equals', action: handleEvaluate },
    { label: 'asin(', value: 'asin(', class: 'func' },
    { label: 'acos(', value: 'acos(', class: 'func' },
    { label: 'atan(', value: 'atan(', class: 'func' },
    { label: 'abs(', value: 'abs(', class: 'func' },
  ];

  const getButtonClass = (btn: typeof buttons[0]) => {
    const base = "rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 shadow-md ";
    switch (btn.class) {
      case 'num': return base + 'bg-gray-700 hover:bg-gray-600 text-white';
      case 'op': return base + 'bg-amber-600 hover:bg-amber-500 text-white';
      case 'func': return base + 'bg-indigo-700 hover:bg-indigo-600 text-white';
      case 'const': return base + 'bg-purple-700 hover:bg-purple-600 text-white';
      case 'paren': return base + 'bg-gray-600 hover:bg-gray-500 text-white';
      case 'clear': return base + 'bg-red-700 hover:bg-red-600 text-white';
      case 'equals': return base + 'bg-green-600 hover:bg-green-500 text-white';
      case 'special': return base + 'bg-teal-700 hover:bg-teal-600 text-white';
      default: return base + 'bg-gray-700 hover:bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Calculator body */}
      <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 w-full max-w-md">
        {/* Display */}
        <div className="bg-gray-950 rounded-xl p-4 mb-4 border border-gray-700">
          <div className="text-gray-400 text-xs h-5 overflow-hidden text-right">
            {history.length > 0 && `${history[0].expr} =`}
          </div>
          <div className="text-white text-2xl font-mono text-right min-h-[2rem] overflow-x-auto">
            {display || '0'}
          </div>
        </div>

        {/* History toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-gray-400 text-xs mb-2 hover:text-white transition-colors"
        >
          {showHistory ? '▼ Hide History' : '▶ Show History'}
        </button>

        {showHistory && (
          <div className="bg-gray-950 rounded-lg p-2 mb-3 max-h-32 overflow-y-auto border border-gray-700">
            {history.length === 0 ? (
              <p className="text-gray-500 text-xs text-center">No history yet</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="text-xs text-gray-300 py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-500">{item.expr}</span> = <span className="text-green-400">{item.result}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Button grid */}
        <div className="grid grid-cols-4 gap-2">
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
              className={`${getButtonClass(btn)} py-3`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression examples */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm mb-2">Try these expressions:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['sin(pi/2)', 'sqrt(144)', '2^10', '5!', 'log(1000)', 'cos(pi)+1'].map(expr => (
            <button
              key={expr}
              onClick={() => setDisplay(expr)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-600 transition-colors"
            >
              {expr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

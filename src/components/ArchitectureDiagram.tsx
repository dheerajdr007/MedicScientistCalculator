export default function ArchitectureDiagram() {
  return (
    <div className="w-full">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-bold mb-6 text-center">Calculator Architecture Pipeline</h3>
        
        {/* Pipeline */}
        <div className="flex flex-col items-center gap-2">
          {/* Input */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg px-6 py-3 text-center w-full max-w-lg border border-blue-500">
            <p className="text-blue-200 text-xs">INPUT</p>
            <p className="text-white font-mono text-sm">"sin(pi/4) + sqrt(2)"</p>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-500 text-2xl">↓</div>
          
          {/* Tokenizer */}
          <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-lg px-6 py-3 text-center w-full max-w-lg border border-green-500">
            <p className="text-green-200 text-xs font-bold">tokenizer.c</p>
            <p className="text-green-100 text-xs mt-1">Lexical Analysis → Token Stream</p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {['[SIN]', '[(]', '[PI]', '[/]', '[4]', '[)]', '[+]', '[SQRT]', '[(]', '[2]', '[)]'].map((t, i) => (
                <span key={i} className="bg-green-800 text-green-200 text-xs px-2 py-0.5 rounded font-mono">{t}</span>
              ))}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-500 text-2xl">↓</div>
          
          {/* Parser */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-lg px-6 py-3 text-center w-full max-w-lg border border-purple-500">
            <p className="text-purple-200 text-xs font-bold">parser.c</p>
            <p className="text-purple-100 text-xs mt-1">Recursive Descent → Abstract Syntax Tree</p>
            {/* Simple AST visualization */}
            <div className="mt-3 flex flex-col items-center text-xs text-purple-200 font-mono">
              <div className="bg-purple-800 px-3 py-1 rounded">[+]</div>
              <div className="flex gap-8 mt-1">
                <div className="flex flex-col items-center">
                  <div className="text-gray-500">/</div>
                  <div className="bg-purple-800 px-2 py-0.5 rounded">[sin]</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-purple-900 px-1.5 py-0.5 rounded">[π]</span>
                    <span className="bg-purple-900 px-1.5 py-0.5 rounded">[4]</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-gray-500">/</div>
                  <div className="bg-purple-800 px-2 py-0.5 rounded">[sqrt]</div>
                  <div className="mt-1">
                    <span className="bg-purple-900 px-1.5 py-0.5 rounded">[2]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-500 text-2xl">↓</div>
          
          {/* Evaluator */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-700 rounded-lg px-6 py-3 text-center w-full max-w-lg border border-amber-500">
            <p className="text-amber-200 text-xs font-bold">evaluator.c</p>
            <p className="text-amber-100 text-xs mt-1">Tree Walk → Compute Result</p>
            <div className="mt-2 flex gap-2 justify-center flex-wrap text-xs">
              <span className="bg-amber-800 text-amber-200 px-2 py-0.5 rounded">sin(π/4) = 0.7071</span>
              <span className="bg-amber-800 text-amber-200 px-2 py-0.5 rounded">√2 = 1.4142</span>
              <span className="bg-amber-800 text-amber-200 px-2 py-0.5 rounded">+ → 2.1213</span>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-500 text-2xl">↓</div>
          
          {/* Output */}
          <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-lg px-6 py-3 text-center w-full max-w-lg border border-red-500">
            <p className="text-red-200 text-xs">OUTPUT</p>
            <p className="text-white font-mono text-lg font-bold">= 2.1213203436</p>
          </div>
        </div>
        
        {/* File responsibilities */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-green-400 font-bold text-sm mb-1">📄 tokenizer.c/h</h4>
            <p className="text-gray-400 text-xs">Converts raw input characters into typed tokens (numbers, operators, function names). Handles whitespace skipping and number parsing.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-purple-400 font-bold text-sm mb-1">📄 parser.c/h</h4>
            <p className="text-gray-400 text-xs">Recursive descent parser that respects operator precedence. Builds an AST with correct associativity (right-associative for ^).</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-amber-400 font-bold text-sm mb-1">📄 evaluator.c/h</h4>
            <p className="text-gray-400 text-xs">Walks the AST recursively to compute the final value. Handles domain errors, overflow detection, and special cases.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-blue-400 font-bold text-sm mb-1">📄 main.c</h4>
            <p className="text-gray-400 text-xs">REPL interface with <span className="text-green-400 font-semibold">bracket matching</span> visualization. Uses ANSI color codes to show matched (green), unclosed (red), and extra (orange) brackets in real-time.</p>
          </div>
        </div>
        
        {/* Bracket Matching Feature */}
        <div className="mt-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Bracket Matching Feature
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Both the C terminal version and the web version feature real-time bracket analysis:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-700">
              <h4 className="text-green-400 text-xs font-bold mb-2">TERMINAL (C version)</h4>
              <div className="font-mono text-xs space-y-1">
                <p><span className="text-green-400">calc&gt;</span> sin(pi/4)</p>
                <p className="text-green-400">  sin<span className="text-green-400">(</span>pi/4<span className="text-green-400">)</span></p>
                <p className="text-gray-500">  ─── Bracket Status ───</p>
                <p><span className="text-gray-500">(</span> opened: <span className="text-green-400">1</span> | <span className="text-gray-500">)</span> closed: <span className="text-green-400">1</span> | <span className="text-green-400">✓ Balanced</span></p>
              </div>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-700">
              <h4 className="text-red-400 text-xs font-bold mb-2">UNMATCHED DETECTION</h4>
              <div className="font-mono text-xs space-y-1">
                <p><span className="text-green-400">calc&gt;</span> sin(pi/4 + cos(</p>
                <p>  sin<span className="text-green-400">(</span>pi/4 + cos<span className="text-red-400 animate-pulse">(</span></p>
                <p className="text-gray-500">  ─── Bracket Status ───</p>
                <p><span className="text-gray-500">(</span> opened: <span className="text-red-400">2</span> | <span className="text-gray-500">)</span> closed: <span className="text-green-400">1</span> | <span className="text-red-400">⚠ Need 1 more ')'</span></p>
                <p className="text-red-400">  ▌</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

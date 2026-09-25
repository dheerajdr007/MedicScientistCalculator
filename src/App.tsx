import { useState } from 'react';
import Calculator from './components/Calculator';
import SourceViewer from './components/SourceViewer';
import ArchitectureDiagram from './components/ArchitectureDiagram';

type Tab = 'calculator' | 'source' | 'architecture';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scientific Calculator in C
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Modular Architecture: Tokenizer → Parser → AST → Evaluator
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-600">
                C11
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-600">
                6 Source Files
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-600">
                Makefile
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {([
              { id: 'calculator' as Tab, label: '🧮 Interactive Calculator', icon: '' },
              { id: 'source' as Tab, label: '📁 Source Code', icon: '' },
              { id: 'architecture' as Tab, label: '🏗️ Architecture', icon: '' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Interactive Demo</h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                This web calculator implements the same logic as the C version. 
                Try entering expressions to see how the calculator works.
              </p>
            </div>
            <Calculator />
          </div>
        )}

        {activeTab === 'source' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">C Source Code</h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                Browse through each source file. The calculator is split into separate modules 
                for tokenizing, parsing, and evaluating expressions.
              </p>
            </div>
            <SourceViewer />
            
            {/* Build instructions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mt-8">
              <h3 className="text-white font-bold text-lg mb-4">🔨 Build Instructions</h3>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
                <p className="text-green-400"># Navigate to the source directory</p>
                <p>$ cd c-source</p>
                <p className="text-green-400 mt-3"># Build the calculator</p>
                <p>$ make</p>
                <p className="text-green-400 mt-3"># Run the calculator</p>
                <p>$ ./calculator</p>
                <p className="text-green-400 mt-3"># Or build and run in one step</p>
                <p>$ make run</p>
                <p className="text-green-400 mt-3"># Clean build artifacts</p>
                <p>$ make clean</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">System Architecture</h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                The calculator follows a classic compiler pipeline architecture, 
                separating concerns into distinct phases.
              </p>
            </div>
            <ArchitectureDiagram />
            
            {/* Operator Precedence Table */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mt-8">
              <h3 className="text-white font-bold text-lg mb-4">⚡ Operator Precedence (Low to High)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400">Precedence</th>
                      <th className="text-left py-2 px-3 text-gray-400">Operators</th>
                      <th className="text-left py-2 px-3 text-gray-400">Associativity</th>
                      <th className="text-left py-2 px-3 text-gray-400">Example</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3">1 (Lowest)</td>
                      <td className="py-2 px-3 font-mono text-amber-400">+ -</td>
                      <td className="py-2 px-3">Left</td>
                      <td className="py-2 px-3 font-mono">1 + 2 - 3</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3">2</td>
                      <td className="py-2 px-3 font-mono text-amber-400">* /</td>
                      <td className="py-2 px-3">Left</td>
                      <td className="py-2 px-3 font-mono">2 * 3 / 4</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3">3</td>
                      <td className="py-2 px-3 font-mono text-amber-400">^</td>
                      <td className="py-2 px-3">Right</td>
                      <td className="py-2 px-3 font-mono">2 ^ 3 ^ 2 = 512</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3">4</td>
                      <td className="py-2 px-3 font-mono text-amber-400">- (unary)</td>
                      <td className="py-2 px-3">Right</td>
                      <td className="py-2 px-3 font-mono">-5 + 3</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3">5</td>
                      <td className="py-2 px-3 font-mono text-amber-400">!</td>
                      <td className="py-2 px-3">Postfix</td>
                      <td className="py-2 px-3 font-mono">5! = 120</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">6 (Highest)</td>
                      <td className="py-2 px-3 font-mono text-amber-400">( ) func()</td>
                      <td className="py-2 px-3">N/A</td>
                      <td className="py-2 px-3 font-mono">sin(pi/2)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supported Functions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-bold text-lg mb-4">📐 Supported Functions & Constants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-indigo-400 font-semibold text-sm mb-2">Trigonometric</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="font-mono">sin(x) - Sine</li>
                    <li className="font-mono">cos(x) - Cosine</li>
                    <li className="font-mono">tan(x) - Tangent</li>
                    <li className="font-mono">asin(x) - Arc sine</li>
                    <li className="font-mono">acos(x) - Arc cosine</li>
                    <li className="font-mono">atan(x) - Arc tangent</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-purple-400 font-semibold text-sm mb-2">Logarithmic & Other</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="font-mono">log(x) - Log base 10</li>
                    <li className="font-mono">ln(x) - Natural log</li>
                    <li className="font-mono">sqrt(x) - Square root</li>
                    <li className="font-mono">abs(x) - Absolute value</li>
                    <li className="font-mono">x! - Factorial</li>
                    <li className="font-mono">x^y - Power</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-green-400 font-semibold text-sm mb-2">Constants</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="font-mono">pi = 3.14159265...</li>
                    <li className="font-mono">e = 2.71828182...</li>
                  </ul>
                  <h4 className="text-amber-400 font-semibold text-sm mb-2 mt-4">Error Handling</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>Division by zero</li>
                    <li>Domain errors (sqrt(-1))</li>
                    <li>Overflow detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Scientific Calculator in C — Modular Architecture with separate files for each phase
            </p>
            <div className="flex gap-4 text-gray-500 text-xs">
              <span>📁 tokenizer.c/h</span>
              <span>📁 parser.c/h</span>
              <span>📁 evaluator.c/h</span>
              <span>📁 main.c</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

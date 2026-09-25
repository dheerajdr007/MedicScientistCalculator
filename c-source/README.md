# Scientific Calculator in C

## Architecture

This calculator is built with a modular architecture, separating concerns into distinct files:

```
┌─────────────────────────────────────────────────────────┐
│                     Input Expression                     │
│                  "sin(pi/4) + sqrt(2)"                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    tokenizer.c                           │
│  Converts input string into a stream of tokens           │
│  e.g., [SIN] [LPAREN] [PI] [DIVIDE] [NUMBER:4] [RPAREN] │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     parser.c                             │
│  Recursive descent parser that builds an AST             │
│  Handles operator precedence and associativity           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Abstract Syntax Tree (AST)                  │
│                    ┌───┐                                 │
│                  ┌─┤ + ├─┐                              │
│                  │ └───┘ │                              │
│              ┌───┴──┐  ┌─┴────┐                        │
│              │ sin  │  │ sqrt │                        │
│              └──┬───┘  └──┬───┘                        │
│                 │         │                             │
│              ┌──┴──┐   ┌──┴──┐                         │
│              │  /  │   │  2  │                         │
│              └─┬─┬─┘   └─────┘                         │
│              ┌─┴─┴─┐                                   │
│              │ pi  4│                                   │
│              └─────┘                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    evaluator.c                           │
│  Recursively evaluates the AST to produce a result       │
│  Handles domain errors, overflow, and edge cases         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                       Result                             │
│                    1.4142135624                          │
└─────────────────────────────────────────────────────────┘
```

## File Structure

| File | Purpose |
|------|---------|
| `tokenizer.h/c` | Lexical analysis - converts input string to tokens |
| `parser.h/c` | Syntax analysis - builds AST from tokens |
| `evaluator.h/c` | Semantic evaluation - computes result from AST |
| `main.c` | REPL interface and command handling |
| `Makefile` | Build system |

## Building

```bash
cd c-source
make
```

## Running

```bash
./calculator
```

## Supported Operations

### Arithmetic
- Addition: `2 + 3`
- Subtraction: `5 - 2`
- Multiplication: `4 * 7`
- Division: `10 / 3`
- Power: `2 ^ 10`
- Factorial: `5!`

### Trigonometric Functions
- `sin(x)`, `cos(x)`, `tan(x)`
- `asin(x)`, `acos(x)`, `atan(x)`

### Other Functions
- `log(x)` - Base 10 logarithm
- `ln(x)` - Natural logarithm
- `sqrt(x)` - Square root
- `abs(x)` - Absolute value

### Constants
- `pi` - 3.14159265...
- `e` - 2.71828182...

## Interactive Commands
- `help` - Show available functions
- `tokens` - Show tokenization of last expression
- `ast` - Show the AST of last expression
- `quit` - Exit the calculator

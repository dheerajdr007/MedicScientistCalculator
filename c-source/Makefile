# Scientific Calculator - Makefile
# Architecture: Tokenizer -> Parser -> AST -> Evaluator

CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g
LDFLAGS = -lm

# Source files
SRCS = main.c tokenizer.c parser.c evaluator.c
OBJS = $(SRCS:.c=.o)
TARGET = calculator

# Default target
all: $(TARGET)

# Link object files into executable
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)
	@echo "Build complete! Run './$(TARGET)' to start the calculator."

# Compile source files to object files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -f $(OBJS) $(TARGET)
	@echo "Clean complete."

# Run the calculator
run: $(TARGET)
	./$(TARGET)

# Show help
help:
	@echo "Available targets:"
	@echo "  all    - Build the calculator (default)"
	@echo "  clean  - Remove build artifacts"
	@echo "  run    - Build and run the calculator"
	@echo "  help   - Show this message"

.PHONY: all clean run help

#!/bin/bash

# Default values
ITERATIONS=10
DELAY=0
LOG_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--iterations)
      ITERATIONS="$2"
      shift 2
      ;;
    -d|--delay)
      DELAY="$2"
      shift 2
      ;;
    -l|--log)
      LOG_FILE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  -n, --iterations N    Run N iterations (default: 10)"
      echo "  -d, --delay S         Wait S seconds between iterations (default: 0)"
      echo "  -l, --log FILE        Log output to FILE"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Function to run the command
run_command() {
  local iteration=$1
  echo "Running iteration $iteration of $ITERATIONS"
  
  # Set up logging
  if [[ -n "$LOG_FILE" ]]; then
    echo "=== Iteration $iteration ===" >> "$LOG_FILE"
    export GENIUS_ACCESS_TOKEN="shU6DraV3Yl9AwdLhG36vCwUoYTbsSV0V3qWyy3keapRqWJ87CsPeZY2XcUeZGEf"
    python -m lyricsgenius song "Manusia Kuat" >> "$LOG_FILE" 2>&1
  else
    export GENIUS_ACCESS_TOKEN="shU6DraV3Yl9AwdLhG36vCwUoYTbsSV0V3qWyy3keapRqWJ87CsPeZY2XcUeZGEf"
    python -m lyricsgenius song "Manusia Kuat"
  fi
  
  # Add timestamp for performance tracking
  if [[ -n "$LOG_FILE" ]]; then
    echo "Completed at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
  fi
}

echo "Starting load test with $ITERATIONS iterations"
echo "Delay between requests: $DELAY seconds"
if [[ -n "$LOG_FILE" ]]; then
  echo "Logging to: $LOG_FILE"
  # Initialize log file
  echo "=== Load Test Started at $(date) ===" > "$LOG_FILE"
  echo "Iterations: $ITERATIONS" >> "$LOG_FILE"
  echo "Delay: $DELAY seconds" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
fi

# Run the iterations
for ((i=1; i<=$ITERATIONS; i++)); do
  run_command $i
  
  # Wait if not the last iteration
  if [[ $i -lt $ITERATIONS && $DELAY -gt 0 ]]; then
    echo "Waiting $DELAY seconds before next iteration..."
    sleep $DELAY
  fi
done

echo "Load test completed"
if [[ -n "$LOG_FILE" ]]; then
  echo "=== Load Test Completed at $(date) ===" >> "$LOG_FILE"
  echo "Results saved to $LOG_FILE"
fi

export type Operation = '+' | '-' | '×' | '÷';
export interface MathQuestion {
  id: number;
  operand1: number;
  operand2: number;
  operation: Operation;
  questionText: string;
  answer: number;
}

const operations: Operation[] = ['+', '-', '×', '÷'];

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(difficulty: number): MathQuestion {
  const level = Math.max(1, Math.min(10, Math.floor(difficulty)));
  let operand1: number, operand2: number, operation: Operation, answer: number;

  switch (true) {
    case level <= 2: // Simple Addition
      operation = '+';
      operand1 = getRandomInt(1, 10);
      operand2 = getRandomInt(1, 10);
      answer = operand1 + operand2;
      break;
    case level <= 4: // Simple Subtraction
      operation = '-';
      operand1 = getRandomInt(5, 20);
      operand2 = getRandomInt(1, operand1 - 1);
      answer = operand1 - operand2;
      break;
    case level <= 6: // Simple Multiplication
      operation = '×';
      operand1 = getRandomInt(2, 10);
      operand2 = getRandomInt(2, 10);
      answer = operand1 * operand2;
      break;
    case level <= 8: // Simple Division
      operation = '÷';
      operand2 = getRandomInt(2, 10);
      answer = getRandomInt(2, 10);
      operand1 = operand2 * answer;
      break;
    default: // Mixed operations with larger numbers
      operation = operations[getRandomInt(0, 3)];
      if (operation === '+') {
        operand1 = getRandomInt(10, 50);
        operand2 = getRandomInt(10, 50);
        answer = operand1 + operand2;
      } else if (operation === '-') {
        operand1 = getRandomInt(20, 100);
        operand2 = getRandomInt(10, operand1 - 5);
        answer = operand1 - operand2;
      } else if (operation === '×') {
        operand1 = getRandomInt(5, 15);
        operand2 = getRandomInt(5, 15);
        answer = operand1 * operand2;
      } else { // '÷'
        operand2 = getRandomInt(2, 12);
        answer = getRandomInt(2, 12);
        operand1 = operand2 * answer;
      }
      break;
  }
  
  return {
    id: Date.now() + Math.random(),
    operand1,
    operand2,
    operation,
    questionText: `What is ${operand1} ${operation} ${operand2}?`,
    answer,
  };
}

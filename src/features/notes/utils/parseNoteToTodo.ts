export type ParsedTodo = {
  title: string;
  completed: boolean;
  subtasks: ParsedTodo[];
  level: number;
};

export function parseNoteToTodo(content: string): ParsedTodo[] {
  const lines = content.split('\n');
  const result: ParsedTodo[] = [];
  const stack: ParsedTodo[] = [];

  // Helper to determine indentation level (2 spaces = 1 level)
  const getIndentLevel = (line: string) => {
    const match = line.match(/^(\s*)/);
    if (!match) return 0;
    return Math.floor(match[1].length / 2);
  };

  for (let line of lines) {
    if (!line.trim()) continue;

    const level = getIndentLevel(line);
    const text = line.trim().replace(/^[-*]\s*|^\d+\.\s*/, ''); // Remove list markers

    const todo: ParsedTodo = {
      title: text,
      completed: line.toLowerCase().includes('[x]'),
      subtasks: [],
      level
    };

    // Remove '[x]' or '[ ]' from title if present
    todo.title = todo.title.replace(/^\[[x ]\]\s*/i, '');

    if (level === 0 || stack.length === 0) {
      result.push(todo);
      stack.length = 0; // Reset stack
      stack.push(todo);
    } else {
      // Find parent in stack
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].subtasks.push(todo);
        stack.push(todo);
      } else {
        result.push(todo);
        stack.push(todo);
      }
    }
  }

  return result;
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon } from "lucide-react";

export default function Page() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-xl font-semibold">Todo</h1>
            <p className="text-sm text-muted-foreground">
              Manage your tasks and todos
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Input Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new todo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAddTodo} disabled={!inputValue.trim()}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Todos List */}
          {todos.length > 0 ? (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <PlusIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No todos yet
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Start by adding a todo above. Check them off as you complete
                them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

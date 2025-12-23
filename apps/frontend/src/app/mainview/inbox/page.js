"use client";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  TrashIcon,
  MoreHorizontalIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  TagIcon,
  SparklesIcon,
} from "lucide-react";

export default function Page() {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [hoverIndex, setHoverIndex] = useState(null);

  // Categories for organizing items
  const categories = [
    { id: "urgent", label: "Urgent", color: "destructive", icon: ClockIcon },
    { id: "important", label: "Important", color: "default", icon: StarIcon },
    { id: "someday", label: "Someday", color: "secondary", icon: CalendarIcon },
    { id: "work", label: "Work", color: "outline", icon: TagIcon },
    { id: "personal", label: "Personal", color: "outline", icon: TagIcon },
  ];

  const handleAddItem = () => {
    if (input.trim()) {
      const newItem = {
        id: Date.now(),
        text: input.trim(),
        category: null,
        createdAt: new Date(),
        aiSuggested: false,
      };
      setItems([newItem, ...items]);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCategorize = (id, categoryId) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, category: categoryId } : item
      )
    );
  };

  const handleAISuggest = (id) => {
    // Placeholder for AI suggestion logic
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, aiSuggested: true } : item
      )
    );
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || null;
  };

  const filteredItems = items.filter((item) => !item.category);
  const categorizedItems = items.filter((item) => item.category);

  return (
    <div className="flex flex-col h-full bg-background rounded-md">
      {/* Header */}
      <div className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 rounded-t-md">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="text-xl font-semibold">Inbox</h1>
                <p className="text-sm text-muted-foreground">
                  Capture ideas and organize them later
                </p>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              {items.length} items
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden rounded-md">
        <div className="h-full flex flex-col">
          {/* Input Section */}
          <div className="border-b p-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Quick Capture
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="Type anything that comes to mind... (Press Enter to add)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[100px] resize-none pr-20"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                    {input.trim() && (
                      <Button
                        size="sm"
                        onClick={handleAddItem}
                        className="h-8 px-3"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Unorganized Items */}
              {filteredItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">Inbox Items</h2>
                    <Badge variant="secondary" className="text-xs">
                      {filteredItems.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="group hover:shadow-md transition-shadow"
                        onMouseEnter={() => setHoverIndex(item.id)}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <p className="text-sm leading-relaxed">
                                {item.text}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>
                                  Added {item.createdAt.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Organize
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {categories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={category.id}
                                        onClick={() =>
                                          handleCategorize(item.id, category.id)
                                        }
                                      >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {category.label}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleAISuggest(item.id)}
                                  >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    AI Suggest Category
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item.id)}
                                    className="text-destructive"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Items */}
              {categorizedItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">Organized Items</h2>
                    <Badge variant="secondary" className="text-xs">
                      {categorizedItems.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {categorizedItems.map((item) => {
                      const categoryInfo = getCategoryInfo(item.category);
                      const Icon = categoryInfo?.icon || TagIcon;
                      return (
                        <Card
                          key={item.id}
                          className="group hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={categoryInfo?.color || "outline"}
                                    className="text-xs"
                                  >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {categoryInfo?.label || "Unknown"}
                                  </Badge>
                                  {item.aiSuggested && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      <SparklesIcon className="h-3 w-3 mr-1" />
                                      AI Suggested
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed">
                                  {item.text}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>
                                    Added {item.createdAt.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Your inbox is empty
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Start by adding items to your inbox. You can organize them
                    later or let AI suggest categories for you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

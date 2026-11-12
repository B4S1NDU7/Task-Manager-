// LLM: Modal dialog with form to create and edit tasks.
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTaskInput, Task, TaskStatus } from "@/lib/api";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  initialTask?: Task | null;
  isSubmitting: boolean;
}

interface TaskFormContentProps {
  initialTask?: Task | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
}

function toDateInputValue(value?: string): string {
  if (!value) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.substring(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TaskFormContent({
  initialTask,
  isSubmitting,
  onClose,
  onSubmit,
}: TaskFormContentProps) {
  const isEditing = Boolean(initialTask);
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [dueDate, setDueDate] = useState(() =>
    toDateInputValue(initialTask?.dueDate)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError("Title is required.");
      return;
    }
    if (trimmedTitle.length > 120) {
      setValidationError("Title must not exceed 120 characters.");
      return;
    }

    const payload: CreateTaskInput = {
      title: trimmedTitle,
      status,
      ...(description.trim() || isEditing
        ? { description: description.trim() }
        : {}),
      ...(dueDate || isEditing ? { dueDate } : {}),
    };

    try {
      await onSubmit(payload);
    } catch {
      // Error handled in parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {validationError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {validationError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="task-title">LLM Title *</Label>
        <Input
          id="task-title"
          placeholder="e.g. Implement user authentication"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (validationError) setValidationError(null);
          }}
          maxLength={120}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">LLM Description</Label>
        <Textarea
          id="task-description"
          placeholder="Optional additional context, steps, or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="task-status">LLM Status</Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as TaskStatus)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-due-date">LLM Due Date</Label>
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TaskDialog({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  isSubmitting,
}: TaskDialogProps) {
  const isEditing = Boolean(initialTask);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "LLM Edit Task" : "LLM Create Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details and click save to apply changes."
              : "Enter details for the new task and click create."}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <TaskFormContent
            key={initialTask ? initialTask.id : "new-task"}
            initialTask={initialTask}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

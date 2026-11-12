// LLM: Main Task Manager application page rendering the task table, status filtering, due date sorting, and task management dialogs.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ListTodo,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { TaskDialog } from "@/components/task-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type CreateTaskInput,
  type Task,
} from "@/lib/api";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortDueDate, setSortDueDate] = useState<"NONE" | "ASC" | "DESC">("NONE");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load tasks from server";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getTasks()
      .then((data) => {
        if (isMounted) {
          setTasks(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load tasks from server";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Task creation/update handler
  const handleSaveTask = async (data: CreateTaskInput) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, data);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updated : t))
        );
        toast.success("Task updated successfully");
      } else {
        const created = await createTask(data);
        setTasks((prev) => [created, ...prev]);
        toast.success("Task created successfully");
      }
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save task";
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Task delete handler
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      toast.success("Task deleted successfully");
      setDeletingTask(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (filterStatus !== "ALL") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          Boolean(t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort by due date
    if (sortDueDate !== "NONE") {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortDueDate === "ASC" ? timeA - timeB : timeB - timeA;
      });
    }

    return result;
  }, [tasks, filterStatus, searchQuery, sortDueDate]);

  // Metric counts
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { total, todo, inProgress, done };
  }, [tasks]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...( /^\d{4}-\d{2}-\d{2}$/.test(isoString) && { timeZone: "UTC" }),
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-16 dark:bg-zinc-950">
      {/* Top Header */}
      <header className="border-b bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                LLM Task Manager
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage, organize, and track your daily priorities
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsDialogOpen(true);
            }}
            className="gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                LLM Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="shadow-xs border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                LLM To Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.todo}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xs border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                LLM In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xs border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                LLM Done
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.done}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  LLM Tasks
                </h2>
                <p className="text-xs text-muted-foreground">
                  View, filter, sort, and update your task items
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTasks}
                disabled={isLoading}
                className="gap-2 self-start sm:self-auto"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Filter and Sort Toolbar */}
            <div className="mt-4 grid grid-cols-1 gap-4 pt-4 border-t sm:grid-cols-3">
              {/* Search */}
              <div className="space-y-1.5">
                <Label htmlFor="search-tasks">LLM Search</Label>
                <Input
                  id="search-tasks"
                  placeholder="Filter by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <Label htmlFor="status-filter" className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  LLM Filter by Status
                </Label>
                <Select
                  value={filterStatus}
                  onValueChange={(val) => setFilterStatus(val ?? "ALL")}
                >
                  <SelectTrigger id="status-filter" className="w-full h-8 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date Sort */}
              <div className="space-y-1.5">
                <Label htmlFor="due-date-sort" className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  LLM Sort by Due Date
                </Label>
                <Select
                  value={sortDueDate}
                  onValueChange={(val) =>
                    setSortDueDate((val as "NONE" | "ASC" | "DESC") ?? "NONE")
                  }
                >
                  <SelectTrigger id="due-date-sort" className="w-full h-8 text-xs">
                    <SelectValue placeholder="None (Creation order)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None (Creation Order)</SelectItem>
                    <SelectItem value="ASC">Due Date: Earliest First</SelectItem>
                    <SelectItem value="DESC">Due Date: Latest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Error State */}
            {error && (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-destructive">
                  LLM Error Loading Tasks
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                  {error}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Make sure the NestJS backend is running at http://localhost:3000
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTasks}
                  className="mt-4 gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !error && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between space-x-4 py-2 border-b last:border-b-0"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredTasks.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <ListTodo className="h-6 w-6" />
                </div>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  LLM: No tasks yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tasks.length > 0
                    ? "No tasks match the active filters. Try resetting the status filter or search query."
                    : "Get started by creating your first task using the button below."}
                </p>
                {tasks.length === 0 && (
                  <Button
                    onClick={() => {
                      setEditingTask(null);
                      setIsDialogOpen(true);
                    }}
                    size="sm"
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Task
                  </Button>
                )}
              </div>
            )}

            {/* Data Table */}
            {!isLoading && !error && filteredTasks.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableHead className="w-[45%]">LLM Task</TableHead>
                    <TableHead className="w-[15%]">LLM Status</TableHead>
                    <TableHead className="w-[18%]">LLM Due Date</TableHead>
                    <TableHead className="w-[12%]">LLM Created</TableHead>
                    <TableHead className="w-[10%] text-right">LLM Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80">
                      <TableCell className="align-top">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell className="align-top text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-xs text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingTask(task);
                              setIsDialogOpen(true);
                            }}
                            title="Edit task"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeletingTask(task)}
                            title="Delete task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Task Dialog (Create / Edit) */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        task={deletingTask}
        isOpen={Boolean(deletingTask)}
        isDeleting={isDeleting}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}

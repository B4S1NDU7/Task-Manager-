// LLM: Render task status as a colored badge.
import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "TODO":
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          To Do
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="secondary"
          className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
        >
          In Progress
        </Badge>
      );
    case "DONE":
      return (
        <Badge
          variant="default"
          className="border-emerald-300 bg-emerald-600 text-white dark:bg-emerald-700"
        >
          Done
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}


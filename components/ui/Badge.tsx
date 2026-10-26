import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "status-open" | "status-progress" | "status-resolved" | "status-closed" | "priority-critical" | "priority-high" | "priority-medium" | "priority-low" | "forest" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  let styleClasses = "bg-gray-100 text-gray-700 border-gray-200";

  if (variant === "status-open") {
    styleClasses = "badge-status-open";
  } else if (variant === "status-progress") {
    styleClasses = "badge-status-progress";
  } else if (variant === "status-resolved") {
    styleClasses = "badge-status-resolved";
  } else if (variant === "status-closed") {
    styleClasses = "badge-status-closed";
  } else if (variant === "priority-critical") {
    styleClasses = "badge-priority-critical";
  } else if (variant === "priority-high") {
    styleClasses = "badge-priority-high";
  } else if (variant === "priority-medium") {
    styleClasses = "badge-priority-medium";
  } else if (variant === "priority-low") {
    styleClasses = "badge-priority-low";
  } else if (variant === "forest") {
    styleClasses = "bg-forest-100 text-forest-800 border-forest-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClasses} ${className}`}
    >
      {children}
    </span>
  );
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Open":
      return "status-open";
    case "In Progress":
      return "status-progress";
    case "Resolved":
      return "status-resolved";
    case "Closed":
      return "status-closed";
    default:
      return "default";
  }
}

export function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case "Critical":
      return "priority-critical";
    case "High":
      return "priority-high";
    case "Medium":
      return "priority-medium";
    case "Low":
      return "priority-low";
    default:
      return "default";
  }
}

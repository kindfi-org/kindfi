import { cn } from "~/lib/utils";

export type Message =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { success: string }
  | { error: string };

export function FormMessage({ message }: { message: Message }) {
  if (!message) return null;

  const type =
    "type" in message
      ? message.type
      : "success" in message
        ? "success"
        : "error" in message
          ? "error"
          : null;

  const text =
    "message" in message
      ? message.message
      : "success" in message
        ? message.success
        : "error" in message
          ? message.error
          : "";

  if (!type || !text) return null;

  return (
    <div
      className={cn(
        "p-3 rounded-md text-sm",
        type === "error" && "bg-destructive/15 text-destructive",
        type === "success" &&
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500",
      )}
    >
      {text}
    </div>
  );
}

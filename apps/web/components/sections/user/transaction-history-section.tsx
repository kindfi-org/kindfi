import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/base/button";
import { Card } from "~/components/base/card";

interface Transaction {
  id: number;
  type: "sent" | "received";
  projectName: string;
  amount: number;
  timeAgo: string;
}

const transactions: Transaction[] = [
  {
    id: 1,
    type: "sent",
    projectName: "Project Name",
    amount: 250.0,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    type: "received",
    projectName: "Project Name",
    amount: 250.0,
    timeAgo: "2 hours ago",
  },
  {
    id: 3,
    type: "sent",
    projectName: "Project Name",
    amount: 250.0,
    timeAgo: "2 hours ago",
  },
  {
    id: 4,
    type: "received",
    projectName: "Project Name",
    amount: 250.0,
    timeAgo: "2 hours ago",
  },
];

export default function TransactionHistory() {
  return (
    <Card className="p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Filter Transaction History"
              className="h-8 w-8 border-gray-200"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh Transaction History"
              className="h-8 w-8 border-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={
                "flex items-center justify-between py-3 px-4 rounded-lg bg-gray-100"
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    transaction.type === "sent" ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {transaction.type === "sent" ? (
                    <ArrowUpRight className={"h-4 w-4 text-red-500"} />
                  ) : (
                    <ArrowDownRight className={"h-4 w-4 text-green-500"} />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.type === "sent" ? "Sent to" : "Received to"}{" "}
                    {transaction.projectName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {transaction.timeAgo}
                  </p>
                </div>
              </div>
              <span
                className={`font-medium ${
                  transaction.type === "sent"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {transaction.type === "sent" ? "-" : "+"}$
                {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

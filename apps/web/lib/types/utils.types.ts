export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type Status = "SUCCESS" | "ERROR";

export type EscrowEndpoint =
  | "initiate"
  | "fund"
  | "dispute"
  | "resolve"
  | "release"
  | "completeMilestone"
  | "approveMilestone";

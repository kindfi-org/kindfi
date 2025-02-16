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

export type TCreateEscrowRequest<T extends EscrowEndpoint> = {
  action: T;
  method: HttpMethod;
  data?: Record<string, any>;
  params?: Record<string, any>;
};

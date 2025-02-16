import { HttpMethod } from "../utils.types";

export type EscrowEndpoint =
  | "initiate"
  | "fund"
  | "dispute"
  | "resolve"
  | "release"
  | "completeMilestone"
  | "approveMilestone"
  | "edit";

export type TCreateEscrowRequest<T extends EscrowEndpoint> = {
  action: T;
  method: HttpMethod;
  data?: Record<string, any>;
  params?: Record<string, any>;
};

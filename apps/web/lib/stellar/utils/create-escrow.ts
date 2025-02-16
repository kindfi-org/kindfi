import { getEndpoint } from "./get-endpoint";
import { AxiosRequestConfig, Method } from "axios";
import { http } from "~/lib/axios/http";
import {
  EscrowEndpoint,
  TCreateEscrowRequest,
} from "~/lib/types/escrow/escrow-endpoint.types";
import { EscrowRequestResponse } from "~/lib/types/escrow/escrow-response.types";

export async function createEscrowRequest<T extends EscrowEndpoint>(
  props: TCreateEscrowRequest<T>
): Promise<EscrowRequestResponse> {
  let response: EscrowRequestResponse | null = null;
  let error: string | null = null;

  const escrowEndpoint = getEndpoint(props.action);

  const config: AxiosRequestConfig = {
    method: props.method as Method,
    url: escrowEndpoint,
    data: props.method !== "GET" ? props.data : undefined,
    params: props.method === "GET" ? props.params : undefined,
  };

  try {
    const axiosResponse = await http.request<EscrowRequestResponse>(config);
    response = axiosResponse.data;
  } catch (err) {
    error = (err as Error).message;
  }

  return {
    unsignedTransaction: response?.unsignedTransaction,
    status: error ? "ERROR" : "SUCCESS",
  };
}

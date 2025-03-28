export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Status = 'SUCCESS' | 'ERROR'

export interface ResponseType {
	type: 'success' | 'error'
	message: string
}

export interface Responses {
	[category: string]: {
		SUCCESS: ResponseType
		ERROR: ResponseType
	}
}

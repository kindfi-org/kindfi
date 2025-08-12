export interface DeviceUpdateParams {
	userId: string
	credentialId: string
	deployeeAddress: string
	aaguid: string
}

export interface DeviceUpdateResponse {
	success: boolean
	message: string
	data?: {
		id: string
		address: string
		aaguid: string
		updated_at: string
	}
	error?: string
}

export interface StellarDeviceData {
	deployeeAddress: string
	aaguid: string
	credentialId: string
}

export const appConfig = {
    features: {
      enableEscrowFeature: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ESCROW_FEATURE === 'true'
    }
  } as const
import { z } from 'zod'

/** Fiat currencies supported by the Etherfuse ramp API for quotes and orders. */
export const ETHERFUSE_FIAT_CURRENCIES = ['MXN', 'BRL'] as const

export type EtherfuseFiatCurrency = (typeof ETHERFUSE_FIAT_CURRENCIES)[number]

export const etherfuseFiatCurrencySchema = z.enum(ETHERFUSE_FIAT_CURRENCIES)

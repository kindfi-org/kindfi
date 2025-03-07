import Tesseract from 'tesseract.js'
import { extractAddress, extractDate } from './extraction'
import type { ExtractedData } from './types'

export const validateDocument = (
  data: ExtractedData,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.date) {
    errors.push('No date found in the document')
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const documentDate = new Date(data.date)
    documentDate.setHours(0, 0, 0, 0)

    const threeMonthsAgo = new Date(today)
    threeMonthsAgo.setMonth(today.getMonth() - 3)
    threeMonthsAgo.setHours(0, 0, 0, 0)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }

    if (documentDate < threeMonthsAgo) {
      errors.push(
        `Document is too old. Must be dated after ${formatDate(threeMonthsAgo)}`,
      )
    }

    if (documentDate > today) {
      errors.push('Document date cannot be in the future')
    }
  }

  if (!data.address) {
    errors.push('No address found in the document')
  } else {
    // Improved regex for international address support
    const addressValidationRegex = 
      /^[0-9a-zA-Z\s,.\-#/]+(?:street|st\.|avenue|ave\.|road|rd\.|lane|ln\.|drive|dr\.|boulevard|blvd\.|court|ct\.|plaza|plz\.|square|sq\.|highway|hwy\.|parkway|pkwy\.|way|circle|cir\.|place|pl\.|terrace|ter\.|apartment|apt\.|building|bldg\.|floor|fl\.|suite|ste\.|unit|house|hs\.|maison|calle|strasse|straße|strada|улица|via|شارع|号|路|거리|マンション|丁目|區|区|市|市区町村)/i
    
    if (!addressValidationRegex.test(data.address)) {
      errors.push('Address appears to be invalid or incomplete')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
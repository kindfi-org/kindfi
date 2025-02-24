const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  
  export const extractDate = (text: string): string | null => {
    const formattedDatePattern = new RegExp(
      `(${monthNames.join('|')})\\s+(\\d{1,2}),?\\s+(\\d{4})`,
      'i',
    )
    const formattedMatch = text.match(formattedDatePattern)
    if (formattedMatch) {
      const [, month, day, year] = formattedMatch
      const monthIndex = monthNames.findIndex(
        (m) => m.toLowerCase() === month.toLowerCase(),
      )
      if (monthIndex !== -1) {
        const date = new Date(
          Number.parseInt(year),
          monthIndex,
          Number.parseInt(day),
        )
        return date.toISOString()
      }
    }
  
    const datePattern = /(\d{2})[/-](\d{2})[/-](\d{4})/g
    const matches = text.match(datePattern)
    if (matches) {
      const dates = matches
        .map((dateStr) => {
          const [day, month, year] = dateStr.split(/[/-]/).map(Number)
          const date = new Date(year, month - 1, day)
          return { date, str: dateStr }
        })
        .filter(({ date }) => !Number.isNaN(date.getTime()))
      if (dates.length > 0) {
        dates.sort((a, b) => a.date.getTime() - b.date.getTime())
        return dates[0].date.toISOString()
      }
    }
    return null
  }
  
  export const extractAddress = (text: string): string | null => {
    const lines = text.split('\n')
    const addressLines = lines.filter((line) =>
      /\d+.*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|circle|cr|way|boulevard|blvd)/i.test(
        line,
      ),
    )
    return addressLines.length > 0 ? addressLines.join('\n') : null
  }

import dayjs from 'dayjs'

console.log({dayjs})
export function unixToDate(unix: number, format = 'YYYY-MM-DD'): string {
    return dayjs(unix).format(format)
  }
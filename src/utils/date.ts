
import dayjs from 'dayjs'

export function unixToDate(unix: number, format = 'YYYY-MM-DD'): string {
    return dayjs(unix).format(format)
  }
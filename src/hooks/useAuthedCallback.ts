import { useRari } from "../context/RariContext"

export const useAuthedCallback = (callback : () => any) => {
  const { login, isAuthed } = useRari()

  const authedCallback = () => {
    if (isAuthed) { 
      return callback()
    } else {
      return login()
    }
  }

  return authedCallback
}
import { useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";

export const useForceAuth = () => {
  const { forceLogin, isAuthed } = useWeb3();

  useEffect(() => {
    if (!isAuthed) {
      setTimeout(() => forceLogin(), 500);
    }
  }, [forceLogin, isAuthed]);

  return isAuthed;
};

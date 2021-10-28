import { useEffect } from "react";
import { useRari } from "context/RariContext";

// Automatically open the web3modal if not on mobile (or just login if they have already used the site)
const Auth = () => {
  const { login } = useRari();

  useEffect(() => {
    if (localStorage.WEB3_CONNECT_CACHED_PROVIDER) {
      login();
    }
  }, []);

  return <></>;
};

export default Auth;

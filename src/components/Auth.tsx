import { useEffect } from "react";
// import { useIsMobile } from "buttered-chakra";
import { useRari } from "context/RariContext";

// Automatically open the web3modal if not on mobile (or just login if they have already used the site)
const Auth = () => {
  const { login } = useRari();
  // const isMobile = useIsMobile();

  useEffect(() => {
    if (localStorage.WEB3_CONNECT_CACHED_PROVIDER) {
      login();
    }
  }, []);

  return <></>;
};

export default Auth;

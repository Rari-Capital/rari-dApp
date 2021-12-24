import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { alchemyURL } from "utils/web3Providers";

const useENS = (address: string | null | undefined) => {
  const [ensName, setENSName] = useState<string | null>(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (address && ethers.utils.isAddress(address)) {
        const provider = new ethers.providers.JsonRpcProvider(alchemyURL);
        let ensName = await provider.lookupAddress(address);
        if (ensName) setENSName(ensName);
      }
    };
    resolveENS();
  }, [address]);

  return { ensName };
};

export default useENS;

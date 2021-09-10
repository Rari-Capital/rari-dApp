import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { fetchFuseTVL } from "utils/fetchTVL";
import { Vaults, Fuse } from "rari-sdk-sharad-v2";
import { fromWei } from "utils/ethersUtils";

export const fetchFuseNumberTVL = async (rari: Vaults, fuse: Fuse) => {
  const tvlETH = await fetchFuseTVL(fuse);

  const ethPrice: number = fromWei(await rari.getEthUsdPriceBN()) as any;

  return (parseInt(tvlETH.toString()) / 1e18) * ethPrice;
};

export const useFuseTVL = () => {
  const { rari, fuse } = useRari();

  return useQuery("fuseTVL", async () => {
    return fetchFuseNumberTVL(rari, fuse);
  });
};

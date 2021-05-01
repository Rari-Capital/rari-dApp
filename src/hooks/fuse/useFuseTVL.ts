import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "rari-sdk/index";
import Fuse from "fuse-sdk";
import { fetchFuseTVL } from "utils/fetchTVL";

export const fetchFuseNumberTVL = async (rari: Rari, fuse: Fuse) => {
  const tvlETH = await fetchFuseTVL(fuse);

  const ethPrice: number = rari.web3.utils.fromWei(
    await rari.getEthUsdPriceBN()
  ) as any;

  return (parseInt(tvlETH.toString()) / 1e18) * ethPrice;
};

export const useFuseTVL = () => {
  const { rari, fuse } = useRari();

  return useQuery("fuseTVL", async () => {
    return fetchFuseNumberTVL(rari, fuse);
  });
};

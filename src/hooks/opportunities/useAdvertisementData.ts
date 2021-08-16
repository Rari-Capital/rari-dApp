import { useAccountBalances } from "context/BalancesContext";
import { SubgraphCToken } from "pages/api/explore";
import { queryTopFuseAsset } from "services/gql";
import useSWR from "swr";

const adFetcher = async (address: string): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("supplyAPY", "desc");

export const useAdvertisementData = () => {
  const [balances, significantTokens] = useAccountBalances();

  const address = significantTokens[0];

  const { data, error } = useSWR(address, adFetcher);
  //   useTokenBalance

  return "Yup";
};

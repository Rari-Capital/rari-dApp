import { useQuery } from "react-query";
import { useRari } from "../context/RariContext";
import {
  fetchPoolInterestEarned,
  PoolInterestEarned,
} from "../utils/fetchPoolInterest";

export const usePoolInterestEarned = (): PoolInterestEarned | undefined => {
  const { rari, address } = useRari();

  const { data } = useQuery(address + " interest earned", () => {
    return fetchPoolInterestEarned(rari, address);
  });

  return data;
};

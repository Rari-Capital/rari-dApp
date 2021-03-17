import { useQuery } from "react-query";

export const useAssetRSS = (address: string) => {
  const { data } = useQuery(
    address + " rss",
    () => {
      return fetch("/api/rss?address=" + address)
        .then((res) => res.json())
        .catch((e) => {
          console.log("Could not fetch RSS!");
          console.log(e);
        }) as Promise<{
        mcap: number;
        volatility: number;
        liquidity: number;
        swapCount: number;
        coingeckoMetadata: number;
        exchanges: number;
        transfers: number;

        lastUpdated: string;
        totalScore: number;
      }>;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 1 day
      cacheTime: 8.64e7,
    }
  );

  return data;
};

export const letterScore = (totalScore: number) => {
  if (totalScore >= 95) {
    return "A++";
  }

  if (totalScore >= 90) {
    return "A+";
  }

  if (totalScore >= 80) {
    return "A";
  }

  if (totalScore >= 70) {
    return "A-";
  }

  if (totalScore >= 60) {
    return "B";
  }

  if (totalScore >= 50) {
    return "C";
  }

  if (totalScore >= 40) {
    return "D";
  }

  if (totalScore >= 30) {
    return "F";
  } else {
    return "UNSAFE";
  }
};

export const usePoolRSS = (poolId: string | number) => {
  const { data } = useQuery(
    poolId + " rss",
    () => {
      return fetch("/api/rss?poolID=" + poolId)
        .then((res) => res.json())
        .catch((e) => {
          console.log("Could not fetch RSS!");
          console.log(e);
        }) as Promise<{
        liquidity: number;
        collateralFactor: number;
        reserveFactor: number;
        utilization: number;
        averageRSS: number;
        upgradeable: number;
        mustPass: number;
        totalScore: number;
        lastUpdated: string;
      }>;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 1 day
      cacheTime: 8.64e7,
    }
  );

  return data;
};

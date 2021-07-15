import { useQuery } from "react-query";
import { score } from "utils/rssUtils";

export const usePoolRSS = (poolId: string | number) => {
  const { data } = useQuery(
    poolId + " rss",
    () => {
      return fetch(
        // Since running the vercel functions requires a Vercel account and is super slow,
        // just fetch this data from the live site in development:
        (process.env.NODE_ENV === "development"
          ? "https://app.rari.capital"
          : "") +
          "/api/rss?poolID=" +
          poolId
      )
        .then((res) => res.json())
        .catch((e) => {
          console.log("Could not fetch RSS!");
          console.log(e);
        }) as Promise<{
        poolScore: number;
        assets: score[];
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

import { useRari } from "context/RariContext";
import { string } from "mathjs";
import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { createOracle } from "utils/createComptroller";

const useOraclesForPool = (
  poolOracle: string | undefined,
  underlyings: string[]
) => {
  const { fuse } = useRari();

  const { data } = useQuery(
    "querying oracles for MasterPriceOracle " + poolOracle,
    async () => {
      if (!poolOracle) return {};

      const mpo = createOracle(poolOracle, fuse, "MasterPriceOracle");

      try {
        const events = await mpo.getPastEvents("NewOracle", {
          fromBlock: 0,
          toBlock: "latest",
        });

        console.log({ events });
        const oracles: {
          [underlyingToken: string]: string;
        } = {};
        for (let e of events)
          oracles[e.returnValues.underlying] = e.returnValues.newOracle;

        return oracles;
      } catch (err) {
        console.error(err);
      }
      return {};
    }
  );

  const tokenToOracleMap = data ?? {};

  //   Maps oracle to list of underlyings
  const oraclesMap = useMemo(() => {
    const map: {
      [oracleAddr: string]: string[];
    } = {};

    Object.entries(tokenToOracleMap).map(
      ([underlying, oracleAddr]: [string, string]) => {
        if (!map[oracleAddr]) {
          map[oracleAddr] = [underlying];
        } else {
          map[oracleAddr] = [...map[oracleAddr], underlying];
        }
      }
    );
    return map;
  }, [tokenToOracleMap]);

  return oraclesMap;
};

export default useOraclesForPool;

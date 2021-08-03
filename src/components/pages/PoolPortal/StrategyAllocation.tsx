/*  This is a dynamically imported component on client-side only */

import { Center, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import Chart from "react-apexcharts";

import { usePoolType } from "context/PoolContext";
import { useRari } from "context/RariContext";
import { useTranslation } from "next-i18next";
import { useQuery } from "react-query";

import { BN } from "utils/bigUtils";
import { Column } from "lib/chakraUtils";
import { getSDKPool, Pool } from "utils/poolUtils";
import {
  USDStrategyAllocationChartOptions,
  ETHStrategyAllocationChartOptions,
} from "utils/chartOptions";

const StrategyAllocation = () => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const poolType = usePoolType();

  const { data: allocations, isLoading: isAllocationsLoading } = useQuery(
    poolType + "allocations",
    async () => {
      const rawAllocations: { [key: string]: BN } = await getSDKPool({
        rari,
        pool: poolType,
      }).allocations.getRawPoolAllocations();

      console.log({ rawAllocations, poolType });

      let allocations: { [key: string]: number } = {};

      for (const [token, amount] of Object.entries(rawAllocations)) {
        const parsedAmount = parseFloat(rari.web3.utils.fromWei(amount));

        if (parsedAmount < 5) {
          continue;
        }

        if (token === "_cash") {
          allocations["Not Deposited"] = parsedAmount;
        } else {
          allocations[token] = parsedAmount;
        }
      }

      const keys = Object.keys(allocations);

      const values = Object.values(allocations);

      return [keys, values] as const;
    }
  );

  const chartOptions =
    poolType === Pool.ETH
      ? ETHStrategyAllocationChartOptions
      : USDStrategyAllocationChartOptions;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment={{
        md: "flex-start",
        base: "center",
      }}
      expand={true}
    >
      <Heading lineHeight={1} size="sm" mb={1}>
        {t("Strategy Allocation")}
      </Heading>

      {isAllocationsLoading ? (
        <Center expand>
          <Spinner />
        </Center>
      ) : (
        <Chart
          options={{
            ...chartOptions,
            labels: allocations![0],
          }}
          type="pie"
          width="100%"
          height="110px"
          series={allocations![1]}
        />
      )}
    </Column>
  );
};

export default StrategyAllocation;

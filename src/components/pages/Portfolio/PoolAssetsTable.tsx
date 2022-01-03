import {
  Avatar,
  Flex,
  Table,
  Text,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { sumBy } from "lodash";
import { useMemo } from "react";

import { CTokenIcon } from "components/shared/CTokenIcon";

import { usePoolIncentives } from "hooks/rewards/usePoolIncentives";
import { useTokensDataAsMap } from "hooks/useTokenData";

import { convertMantissaToAPY, convertMantissaToAPR } from "utils/apyUtils";
import { smallUsdFormatter } from "utils/bigUtils";
import { FusePoolData, USDPricedFuseAsset } from "utils/fetchFusePoolData";

import { tdStyle, thStyle } from "./styles";

/**
 * Given a pool's data in the `poolData` prop, displays the current user's
 * borrowed or supplied assets based on the `filter` prop (either "supplied" or
 * "borrowed").
 */
const PoolAssetsTable = ({
  poolData,
  filter,
}: {
  poolData: FusePoolData;
  filter: "supplied" | "borrowed";
}) => {
  const assets: USDPricedFuseAsset[] = poolData.assets;
  const tokensData = useTokensDataAsMap(
    assets.map(({ underlyingToken }) => underlyingToken)
  );

  const poolIncentives = usePoolIncentives(poolData?.comptroller);
  const filteredAssets = useMemo(
    () =>
      poolData.assets.filter((asset: USDPricedFuseAsset) => {
        const balance =
          filter === "supplied" ? asset.supplyBalance : asset.borrowBalance;
        return balance > 0;
      }),
    [poolData, filter]
  );

  if (filteredAssets.length === 0) {
    return <Text>No positions</Text>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th style={thStyle} borderBottomWidth={0}>
            Amount
          </Th>
          <Th style={thStyle} borderBottomWidth={0}>
            {filter === "supplied" ? "APY" : "APR"}
          </Th>
          <Th style={thStyle} borderBottomWidth={0} />
        </Tr>
      </Thead>
      <Tbody>
        {filteredAssets.map((asset: USDPricedFuseAsset) => {
          const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
          const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

          const balance =
            filter === "supplied" ? asset.supplyBalance : asset.borrowBalance;
          const balanceUSD =
            filter === "supplied"
              ? asset.supplyBalanceUSD
              : asset.borrowBalanceUSD;
          const rate = filter === "supplied" ? supplyAPY : borrowAPR;
          const incentives = (
            poolIncentives.incentives?.[asset.cToken] ?? []
          ).filter((incentive) => {
            const speed =
              filter === "supplied"
                ? incentive.supplySpeed
                : incentive.borrowSpeed;
            return speed !== 0;
          });

          const incentiveRate = sumBy(incentives, (incentive) => {
            if (filter === "supplied") {
              return incentive.supplyAPY;
            }
            return incentive.borrowAPR;
          });

          return (
            <Tr>
              <Td style={tdStyle}>
                <Flex alignItems="center">
                  <Avatar
                    src={tokensData[asset.underlyingToken]?.logoURL ?? ""}
                    size="xs"
                    marginRight={2}
                  />
                  {smallUsdFormatter(
                    balance / 10 ** asset.underlyingDecimals
                  ).replace("$", "")}{" "}
                  {asset.underlyingSymbol}
                </Flex>
                <Text color="rgba(255,255,255,0.5)" fontSize="sm" mt={3}>
                  {smallUsdFormatter(balanceUSD)}
                </Text>
              </Td>
              <Td style={tdStyle}>
                {rate.toFixed(2)}%
                {incentives.length > 0 && (
                  <Flex alignItems="center" mt={3}>
                    <Text color="rgba(255,255,255,0.5)" fontSize="sm">
                      {filter === "supplied" ? "+" : "-"}
                    </Text>
                    <Flex mx={2}>
                      {incentives.map((incentive) => (
                        <CTokenIcon address={incentive.rewardToken} size="xs" />
                      ))}
                    </Flex>
                    <Text color="rgba(255,255,255,0.5)" fontSize="sm">
                      {incentiveRate.toFixed(2)}%{" "}
                      {filter === "supplied" ? "APY" : "APR"}
                    </Text>
                  </Flex>
                )}
              </Td>
              <Td style={tdStyle} />
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default PoolAssetsTable;

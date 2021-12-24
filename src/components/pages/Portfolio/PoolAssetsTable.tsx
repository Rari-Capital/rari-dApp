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

  // TODO(nathanhleung) display liquidity mining incentives
  const poolIncentives = usePoolIncentives(poolData?.comptroller);

  const filteredAssets = poolData.assets.filter((asset: USDPricedFuseAsset) => {
    const balance =
      filter === "supplied" ? asset.supplyBalance : asset.borrowBalance;
    return balance > 0;
  });

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
                <Text color="rgba(255,255,255,0.5)" fontSize="sm" mt="3">
                  {smallUsdFormatter(balanceUSD)}
                </Text>
              </Td>
              <Td style={tdStyle}>{rate.toFixed(2)}%</Td>
              <Td style={tdStyle} />
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default PoolAssetsTable;

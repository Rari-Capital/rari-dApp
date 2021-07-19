// Components
import { Heading, Text } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";
import { useTokenMarketAggregateInfo } from "hooks/tokens/useTokenMarketInfo";
import { useTokenBalance } from "hooks/useTokenBalance";

// Hooks
import { TokenData } from "hooks/useTokenData";
import { useMemo } from "react";
import { smallUsdFormatter } from "utils/bigUtils";

// Utils
import { Column, Row } from "lib/chakraUtils";
const AssetOpportunities = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  const { data } = useTokenBalance(token.address);

  const balance: string = useMemo(
    () => (data ? (parseFloat(data.toString()) / 1e18).toFixed(2) : "0"),
    [data]
  );

  const hasBalance = useMemo(() => parseFloat(balance) > 0, [balance]);

  const marketInfo = useTokenMarketAggregateInfo(token.address);

  const usdBalance: string = useMemo(
    () =>
      balance && marketInfo?.market_data?.current_price?.usd
        ? smallUsdFormatter(
            parseFloat(balance) * marketInfo.market_data.current_price.usd
          )
        : smallUsdFormatter(0),

    [balance, marketInfo]
  );

  return !hasBalance ? null : (
    <DashboardBox height="100%" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="space-around"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        p={5}
      >
        <Heading fontSize="lg">{token.symbol} Balance:</Heading>
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          mt={2}
        >
          <Text fontSize="xl" fontWeight="bold">
            {balance} {token.symbol}
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="grey" ml={2}>
            {usdBalance}
          </Text>
        </Row>
      </Column>
    </DashboardBox>
  );
};
export default AssetOpportunities;

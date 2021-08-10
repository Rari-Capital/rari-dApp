// Components
import { Avatar } from "@chakra-ui/avatar";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/layout";
import AppLink from "components/shared/AppLink";
import DashboardBox from "components/shared/DashboardBox";
import { useAdvertisementData } from "hooks/opportunities/useAdvertisementData";

// Constants

// Hooks
import Image from "next/image";

// Utils
import { Column } from "lib/chakraUtils";
import { useAccountBalances } from "context/BalancesContext";
import axios from "axios";
import useSWR from "swr";
import {
  APIBestOpportunityData,
  APIBestOpportunityReturn,
} from "pages/api/explore/bestOpportunity";
import { convertMantissaToAPY } from "utils/apyUtils";

const adFetcher = async (route: string): Promise<APIBestOpportunityReturn> => {
  const result = await axios.get(route);
  return result.data;
};

const InternalAd = ({ ...boxProps }: { [x: string]: any }) => {
  const adData = useAdvertisementData();

  const [balances, significantTokens] = useAccountBalances();

  const address = significantTokens[0];

  const { data, error } = useSWR(
    `/api/explore/bestOpportunity?address=${address}`,
    adFetcher
  );

  const { tokensData, bestOpportunity } = data ?? {};

  if (!data || !tokensData || !bestOpportunity) return <> </>;

  return (
    <AppLink href={`/fuse/pools/${bestOpportunity.bestAsset.fusePool.id}`}>
      <DashboardBox height="300px" w="100%" {...boxProps}>
        <Column
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          h="100%"
          w="100%"
          p={5}
        >
          <Avatar src={tokensData[address]?.logoURL} boxSize="120px" />
          <Heading mt={6} textAlign="center" fontSize="xl">
            Your {balances[address]?.toFixed(2)} {tokensData[address]?.symbol}{" "}
            could be earning{" "}
            {convertMantissaToAPY(
              bestOpportunity.bestAsset.supplyRatePerBlock,
              365
            )}
            % APY
          </Heading>
          <AppLink href="/pool/yield">
            <Text mt={6} color="grey" fontWeight="bold">
              Deposit Today
            </Text>
          </AppLink>
        </Column>
      </DashboardBox>
    </AppLink>
  );
};

export default InternalAd;

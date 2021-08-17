// Components
import { Avatar } from "@chakra-ui/avatar";
import { Heading, Text } from "@chakra-ui/layout";
import AppLink from "components/shared/AppLink";
import DashboardBox from "components/shared/DashboardBox";
import { useAdvertisementData } from "hooks/opportunities/useAdvertisementData";

// Hooks
import Image from "next/image";

// Utils
import { Column } from "lib/chakraUtils";
import { useAccountBalances } from "context/BalancesContext";

const InternalAd = ({ ...boxProps }: { [x: string]: any }) => {
  const [balances, significantTokens] = useAccountBalances();
  const adData = useAdvertisementData(significantTokens);
  
  const { tokensData, asset } = adData ?? {};
  if (!adData || !tokensData || !asset) return <> </>;
  const { address } = asset.underlying;


  return (
    <AppLink href={`/fuse/pool/${asset.pool?.index}`}>
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
            could be earning {parseFloat(asset.supplyAPY).toFixed(2)}% APY
          </Heading>
          <AppLink href={`/fuse/pool/${asset.pool?.index}`}>
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

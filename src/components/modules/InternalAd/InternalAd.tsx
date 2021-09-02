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
import { Button } from "@chakra-ui/react";

const InternalAd = ({ ...boxProps }: { [x: string]: any }) => {
  const [balances, significantTokens] = useAccountBalances();
  const adData = useAdvertisementData(significantTokens);

  const { tokensData, asset } = adData ?? {};
  if (!adData || !tokensData || !asset) return <> </>;
  const { address } = asset.underlying;

  return (
    <DashboardBox height="300px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        h="100%"
        w="100%"
        p={5}
      >
        <Avatar src={tokensData[address]?.logoURL} boxSize="100px" />
        <Heading mt={6} textAlign="center" fontSize="xl">
          Your{" "}
          <span color={tokensData[address].color}>
            {balances[address]?.toFixed(2)} {tokensData[address]?.symbol}{" "}
          </span>
          could be earning{" "}
          <span color={tokensData[address].color}>
            {parseFloat(asset.supplyAPY).toFixed(2)}% APY
          </span>
        </Heading>
        <AppLink href={`/fuse/pool/${asset.pool?.index}`} mt={2} className="no-underline">
          <Button
            colorScheme="green"
            _hover={{ transform: "scale(1.04)" }}
            className="no-underline"
            mt={2}
          >
            Deposit Today
          </Button>
        </AppLink>
      </Column>
    </DashboardBox>
  );
};

export default InternalAd;

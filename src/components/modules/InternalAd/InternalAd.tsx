// Components
import { Avatar } from "@chakra-ui/avatar";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/layout";
import AppLink from "components/shared/AppLink";
import DashboardBox from "components/shared/DashboardBox";
import { useAdvertisementData } from "hooks/opportunities/useAdvertisementData";

// Constants

// Hooks
import { TokenData } from "hooks/useTokenData";
import Image from "next/image";

// Utils
import { Column, Row } from "lib/chakraUtils";

const InternalAd = ({ ...boxProps }: { [x: string]: any }) => {
  const adData = useAdvertisementData();

  return (
    <DashboardBox height="300px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        h="100%"
        w="100%"
        p={5}
      >
        <Image src={`/static/icons/dai-glow.svg`} height="200px" width="200px" />
        <Heading mt={6} textAlign="center" fontSize="xl">   
          Your 9,560 DAI could be earning 16% APY
        </Heading>
        <AppLink href='/pool/yield'>
          <Text mt={6} color="grey" fontWeight="bold">Deposit Today</Text>
        </AppLink>
      </Column>
    </DashboardBox>
  );
};

export default InternalAd;

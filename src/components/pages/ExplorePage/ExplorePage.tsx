import { Heading, Text} from "@chakra-ui/react"
import { Box, Divider, SimpleGrid } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import AppLink from "components/shared/AppLink";

import DashboardBox from "components/shared/DashboardBox";
import { APYWithRefreshMovingStat } from "components/shared/MovingStat";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useTVLFetchers } from "hooks/useTVL";
import { useTranslation } from "react-i18next";
import { shortUsdFormatter, smallUsdFormatter, usdFormatter } from "utils/bigUtils";
import { Column, Row } from "utils/chakraUtils";

const ExplorePage = () => {

    const isMobile = useIsSmallScreen();
  const { getNumberTVL } = useTVLFetchers();
  const { t } = useTranslation()

    return (
      <Column
         mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        color="#FFFFFF"
        mx="auto"
        mt={5}
        width="100%"
        px={isMobile ? 3 : 10}  
      >
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w="100%"
            mb={5}
          >
           <APYWithRefreshMovingStat
              formatStat={smallUsdFormatter}
              fetchInterval={40000}
              loadingPlaceholder="$?"
              apyInterval={100}
              fetch={getNumberTVL}
              queryKey={"totalValueLocked"}
              apy={0.15}
              statSize="2xl"
              captionSize="md"
              caption={t("The Rari Protocol currently secures:")}
              crossAxisAlignment="flex-start"
              captionFirst={true}
            />
          </Row>

          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w="100%"
            h="100%"
            mb={5}
          >
              <DashboardBox w="100%" h="250px">
              <SimpleGrid columns={3} spacing={0} h="100%" w="100%">
                  <GridBox bg="" />
                  <GridBox bg="" />
                  <GridBox bg="" />
                  <GridBox bg="" />
                  <GridBox bg="" heading="Newest Yield Aggregator"/>
                  <GridBox bg="" />
                </SimpleGrid>
              </DashboardBox>
          </Row>

      </Column>
    )
}

export default ExplorePage


const GridBox = ({ bg, heading="Top earning Stablecoin" }: {bg: string, heading?: string}) => {
return (
    <AppLink 
    href="/token/usdc"
    as={Column}
     w="100%"
      h="100%" 
      bg={bg} 
      mainAxisAlignment="flex-start" 
      crossAxisAlignment="flex-start"
      p={4} 
      border="1px solid #272727"
      _hover={{border:"1px solid grey"}}
      >

    <Row h="100%" w="100%" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">

        <Column w="100%" h="100%" bg={bg} mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" flexBasis="75%" flexGrow={1}>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Heading fontSize="lg" color="grey">{heading}</Heading>
            </Row>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" mt='auto'>
                <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                    <Heading fontSize="2xl">USDC</Heading>
                    <Heading fontSize="sm" color="grey">3% weekly, 12% monthly</Heading>
                </Column>
            </Row>
        </Column>

        <Column w="100%" h="100%" mainAxisAlignment="center" crossAxisAlignment="center" flexBasis="25%">
           <Avatar 
           src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
           boxSize={"75%"}
           />
        </Column>
    </Row>
    </AppLink>
)

}
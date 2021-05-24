import { Box, Heading, Text, Link, SimpleGrid, Image } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "buttered-chakra";
import DashboardBox from "components/shared/DashboardBox";
import NewHeader from "components/shared/Header2/NewHeader";
import useTokenDataBySymbol from "hooks/tokens/useTokenDataBySymbol";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

const TokenDetails = () => {
  const { symbol } = useParams();
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  const tokenSymbol = useMemo(() => symbol.toUpperCase(), [symbol]);

  const { tokenData, tokenMarketData } = useTokenDataBySymbol(tokenSymbol);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      width="100%"
    >
      {/* Header */}
      <NewHeader />
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        px={isMobile ? 3 : 10}
        mt={10}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          //   bg="aqua"
          w="100%"
        >
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            w="100%"
            mr={!isMobile ? 10 : 0}
            p={3}
            flexBasis={!isMobile ? "65%" : "100%"}
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Image
                src={
                  tokenData?.logoURL ??
                  "https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png"
                }
                boxSize="50"
              />
              <Heading ml={4} size={isMobile ? "md" : "lg"}>
                {tokenData?.name} ({tokenData?.symbol}){" "}
              </Heading>
            </Row>

            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center"  ml=    {5}>
              <Box size="sm" mr={3}>
                <Image
                  src={
                    "https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png"
                  }
                  boxSize="20px"
                />
              </Box>
              <Box size="sm" mr={3}>
                <Image
                  src={
                    "https://etherscan.io/images/brandassets/etherscan-logo-circle.jpg"
                  }
                  boxSize="20px"
                />
              </Box>
              <Box size="sm" mr={3}>
                <Image
                  src={"https://cryptologos.cc/logos/uniswap-uni-logo.png"}
                  boxSize="20px"
                />
              </Box>
            </Row>
          </Row>
          {!isMobile && <Box w="100%" flexBasis={"35%"} />}
        </Row>

        {/* Chart + Foursquare */}
        <RowOrColumn
          width="100%"
          height={"sm"}
          isRow={!isMobile}
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          p={2}
          bg="pink"
        >
          {/* Chart */}
          <DashboardBox
            height="100%"
            w="100%"
            h="100%"
            mr={10}
            mt={0}
            flexBasis={"65%"}
          >
            <Heading>Chart</Heading>
          </DashboardBox>

          {/* Foursq */}
          <DashboardBox
            height="100%"
            w="100%"
            flexBasis={"35%"}
            mt={isMobile ? 2 : 0}
          >
            <Heading>Foursquare</Heading>
          </DashboardBox>
        </RowOrColumn>

        <RowOrColumn
          width="100%"
          height={"lg"}
          isRow={!isMobile}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          p={2}
          bg="lime"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w={"100%"}
            h={"100%"}
            flexBasis={"65%"}
            mr={10}
          >
            <DashboardBox height="100%" w="100%" h="100%" mr={10} mt={0}>
              <Heading>Fuse Pools</Heading>
            </DashboardBox>

            <DashboardBox height="100%" w="100%" h="100%" mt={5}>
              <Heading>Tx History</Heading>
            </DashboardBox>
          </Column>

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w={"100%"}
            h={"100%"}
            flexBasis={"35%"}
            mt={isMobile ? 5 : 0}
          >
            <DashboardBox height="100%" w="100%" h="100%" mr={10} mt={0}>
              <Heading>Earn stuff</Heading>
            </DashboardBox>

            <DashboardBox height="100%" w="100%" h="100%" mt={5}>
              <Heading>Fuse stuff</Heading>
            </DashboardBox>
          </Column>
        </RowOrColumn>
      </Column>
    </Column>
  );
};

export default TokenDetails;

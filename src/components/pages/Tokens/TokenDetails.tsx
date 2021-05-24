import { Box, Heading, Text, Link, SimpleGrid } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "buttered-chakra";
import DashboardBox from "components/shared/DashboardBox";
import NewHeader from "components/shared/Header2/NewHeader";
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

  const tokenSymbol = useMemo(() => symbol.toUpperCase(), []);

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
        px={10}
        mt={10}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          bg="aqua"
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
            <Heading>{tokenSymbol}</Heading>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Heading size="sm" mr={3}>
                1
              </Heading>
              <Heading size="sm" mr={3}>
                2
              </Heading>
              <Heading size="sm" mr={3}>
                3
              </Heading>
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

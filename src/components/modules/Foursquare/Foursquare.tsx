// Components
import { Box, Divider, Heading, SimpleGrid, Text } from "@chakra-ui/layout";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";
import DashboardBox from "components/shared/DashboardBox";
import MotionBox from "components/shared/MotionBox";
import { AnimatePresence, AnimateSharedLayout } from "framer-motion";

// Hooks
import { TokenData } from "hooks/useTokenData";
import { useCallback, useMemo, useState } from "react";

// Utils
import { Column, Row } from "lib/chakraUtils";

export enum FoursquareNav {
  EARN = "Earn",
  FUSE = "Fuse",
  INSTALEV = "InstaLev",
  TRADE = "Trade",
}
const AssetOpportunities = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  const [nav, setNav] = useState<FoursquareNav | null>(null);

  const hasSelection = useMemo(() => !!nav, [nav]);

  const isSelected = useCallback(
    (thisNav: FoursquareNav) => {
      return !!hasSelection && thisNav === nav;
    },
    [nav]
  );

  return (
    <DashboardBox height="300px" w="100%" {...boxProps} bg="">
      <Box h="100%" w="100%">
        <SimpleGrid columns={2} spacing={0} h="100%" w="100%">
          <AnimateSharedLayout>
            <MotionBox
              bg={nav === FoursquareNav.EARN ? "pink" : ""}
              h="100%"
              w="100%"
              borderBottom="1px solid #272727"
              borderRight="1px solid #272727"
              onClick={() =>
                hasSelection ? setNav(null) : setNav(FoursquareNav.EARN)
              }
              _hover={{ cursor: "pointer", bg: "#272727" }}
              layout
              // layoutId="swag"
            >
              <AnimatePresence>
                {nav === FoursquareNav.EARN && (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Heading>Hello</Heading>
                  </MotionBox>
                )}
              </AnimatePresence>{" "}
              <AnimatePresence>
                {nav === null && (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Heading>Earn</Heading>
                  </MotionBox>
                )}
              </AnimatePresence>
            </MotionBox>
            <MotionBox
              bg={nav === FoursquareNav.FUSE ? "pink" : ""}
              h={isSelected(FoursquareNav.FUSE) ? "100%" : "0%"}
              w="100%"
              borderBottom="1px solid #272727"
              borderLeft="1px solid #272727"
              onClick={() => setNav(FoursquareNav.FUSE)}
              _hover={{ cursor: "pointer", bg: "#272727" }}
              layout
              // layoutId="swag"
            >
              {" "}
              Fuse{" "}
            </MotionBox>
            <MotionBox
              bg={nav === FoursquareNav.INSTALEV ? "pink" : ""}
              h="100%"
              w="100%"
              borderTop="1px solid #272727"
              borderRight="1px solid #272727"
              onClick={() => setNav(FoursquareNav.INSTALEV)}
              _hover={{ cursor: "pointer", bg: "#272727" }}
              layout
              // layoutId="swag"
            >
              {" "}
              INSTALEV{" "}
            </MotionBox>
            <MotionBox
              bg={nav === FoursquareNav.TRADE ? "pink" : ""}
              h="100%"
              w="100%"
              borderTop="1px solid #272727"
              borderLeft="1px solid #272727"
              layout
              onClick={() => setNav(FoursquareNav.TRADE)}
              _hover={{ cursor: "pointer", bg: "#272727" }}
              // layoutId="swag"
            >
              TRADE
            </MotionBox>
          </AnimateSharedLayout>
        </SimpleGrid>
      </Box>
    </DashboardBox>
  );
};
export default AssetOpportunities;
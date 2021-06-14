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
import { Column, Row } from "utils/chakraUtils";

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
      return thisNav === nav;
    },
    [nav]
  );

  return (
    <DashboardBox height="100%" w="100%" {...boxProps} bg="">
      <AnimatePresence>
        <MotionBox
          h="100%"
          w="100%"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SimpleGrid columns={2} spacing={0} h="100%" w="100%">
            <MotionBox
              bg={nav === FoursquareNav.EARN ? "pink" : ""}
              h="100%"
              w="100%"
              borderBottom="1px solid #272727"
              borderRight="1px solid #272727"
              onClick={() => setNav(FoursquareNav.EARN)}
              _hover={{ cursor: "pointer" }}
              layout
            />
            <MotionBox
              bg={nav === FoursquareNav.FUSE ? "pink" : ""}
              h={isSelected(FoursquareNav.FUSE) ? "100%" : "0%"}
              w="100%"
              borderBottom="1px solid #272727"
              borderLeft="1px solid #272727"
              onClick={() => setNav(FoursquareNav.FUSE)}
              _hover={{ cursor: "pointer" }}
              layout
            />
            <MotionBox
              bg={nav === FoursquareNav.INSTALEV ? "pink" : ""}
              h="100%"
              w="100%"
              borderTop="1px solid #272727"
              borderRight="1px solid #272727"
              onClick={() => setNav(FoursquareNav.INSTALEV)}
              _hover={{ cursor: "pointer" }}
              layout
            />
            <MotionBox
              bg={nav === FoursquareNav.TRADE ? "pink" : ""}
              h="100%"
              w="100%"
              borderTop="1px solid #272727"
              borderLeft="1px solid #272727"
              layout
              onClick={() => setNav(FoursquareNav.TRADE)}
              _hover={{ cursor: "pointer" }}
              bg="pink"
            />
          </SimpleGrid>
        </MotionBox>
      </AnimatePresence>
    </DashboardBox>
  );
};
export default AssetOpportunities;

// const FourSquareBox = ({ thisNav, nav, setNav} : { thisNav: FoursquareNav, nav: FoursquareNav, setNav: () =>}) => {

//     return (
//         <MotionBox
//               bg={nav === FoursquareNav.TRADE ? "pink" : ""}
//               h="100%"
//               w="100%"
//               borderTop="1px solid #272727"
//               borderLeft="1px solid #272727"
//               layout
//               onClick={() => setNav(FoursquareNav.TRADE)}
//               _hover={{cursor: 'pointer'}}
//             />
//     )
// }

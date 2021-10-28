// Components
import { Divider, Heading, Text } from "@chakra-ui/layout";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";
import DashboardBox from "components/shared/DashboardBox";

// Hooks
import { TokenData } from "hooks/useTokenData";
import { useMemo, useState } from "react";

// Utils
import { Column, Row } from "lib/chakraUtils";

import TrancheOpportunities from "./TrancheOpportunities";
import VaultsList from "components/shared/Lists/VaultsList";
import FuseList from "components/shared/Lists/Fuse/FuseListForToken";

export enum OpportunityNav {
  FUSE = "Fuse",
  TRANCHES = "Tranches",
  EARN = "Earn",
}
const AssetOpportunities = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  const [nav, setNav] = useState<OpportunityNav>(OpportunityNav.FUSE);

  return (
    <DashboardBox height="500px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="25%"
        w="100%"
        p={5}
      >
        <Heading> Opportunities</Heading>
        <NavBar setNav={setNav} token={token} />
      </Column>
      <Divider />
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        h="75%"
        w="100%"
        // bg="green"
        overflowY="scroll"
      >
        {nav === OpportunityNav.FUSE && <FuseList token={token} />}
        {nav === OpportunityNav.TRANCHES && (
          <TrancheOpportunities token={token} />
        )}
        {nav === OpportunityNav.EARN && <VaultsList token={token} />}
      </Column>
    </DashboardBox>
  );
};
export default AssetOpportunities;

const NavBar = ({ setNav, token }: { setNav: any; token: TokenData }) => {
  // Filter out Nav Items for Opportunities based on the asset
  const navItems: OpportunityNav[] = useMemo(() => {
    // Only DAI has tranches
    if (token.symbol !== "DAI") {
      return Object.values(OpportunityNav).filter(
        (nav) => nav !== OpportunityNav.TRANCHES
      );
    }

    return Object.values(OpportunityNav);
  }, [token]);

  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="nav"
      isFitted
      my={4}
      onChange={(i: number) => setNav(navItems[i])}
      size="sm"
    >
      <TabList borderRadius="2xl" bg="#252626" display="flex">
        <Row mainAxisAlignment="center" crossAxisAlignment="center">
          {navItems.map((nav) => {
            if (
              nav === OpportunityNav.EARN &&
              !["DAI, USDC"].includes(token.symbol)
            )
              return;
            return (
              <Tab key={nav} borderRadius="2xl" _hover={{ color: "green.200" }}>
                <Text
                  fontSize="xs"
                  color="white"
                  _hover={{ color: "green.200" }}
                >
                  {nav}
                </Text>
              </Tab>
            );
          })}
        </Row>
      </TabList>
    </Tabs>
  );
};

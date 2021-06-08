import { Divider, Heading, Text } from "@chakra-ui/layout";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";
import DashboardBox from "components/shared/DashboardBox";
import { TokenData } from "hooks/useTokenData";
import { useState } from "react";
import { Column, Row } from "utils/chakraUtils";
import FuseOpportunities from "./FuseOpportunities";

export enum OpportunityNav {
  FUSE = 'Fuse',
  TRANCHES = 'Tranches',
  EARN = 'Earn',
  TANKS = 'Tanks'
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
    <DashboardBox
      height="500px"
      w="100%"
      // bg="aqua"
      {...boxProps}
    >
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="25%"
        w="100%"
        p={5}
      >
        <Heading>Opportunities</Heading>
        <NavBar setNav={setNav} />
      </Column>
      <Divider />
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        h="75%"
        w="100%"
        // bg="green"
        p={3}
        overflowY="scroll"
      >
        {nav === OpportunityNav.FUSE && <FuseOpportunities token={token} />}
      </Column>
    </DashboardBox>
  );
};
export default AssetOpportunities;

const NavBar = ({ setNav }: { setNav: any }) => {

  const handleTabChange = (index: number) => {
    setNav(Object.values(OpportunityNav)[index]);
  };

  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="green"
      my={4}
      onChange={handleTabChange}
      size="sm"
    >
      <TabList borderRadius="2xl" bg="#252626" display="flex">
          <Row mainAxisAlignment="center" crossAxisAlignment="center">
            {Object.values(OpportunityNav).map(nav => 
                <Tab borderRadius="2xl" _hover={{textStyle: "underline"}}>
                    <Text fontSize="xs" color="white" _hover={{textStyle: "underline"}}>
                        {nav}
                    </Text>
                </Tab>)}
          </Row>
      </TabList>
    </Tabs>
  );
};

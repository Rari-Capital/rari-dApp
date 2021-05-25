import { useState } from "react";

import { PixelSize, Row } from "buttered-chakra";

//  Components
import { DASHBOARD_BOX_SPACING } from "../DashboardBox";
import { Heading } from "@chakra-ui/layout";
import { AccountButton } from "../AccountButton";

import { AnimatedSmallLogo } from "components/shared/Logos";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const NewHeader = () => {

  return (
    <Row
      color="#FFFFFF"
      px={4}
      height="38px"
      my={4}
      mainAxisAlignment="space-around"
      crossAxisAlignment="center"
      overflowX="visible"
      overflowY="visible"
      width="100%"
      zIndex={3}
      // bg="pink"
    >
      <AnimatedSmallLogo />
      <Heading>RARI</Heading>
      {/* <AccountButton /> */}
    </Row>
  );
};

export default NewHeader;

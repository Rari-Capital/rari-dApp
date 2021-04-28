import React, { Dispatch, SetStateAction } from "react";

// Components
import DashboardBox from "components/shared/DashboardBox";
import { Center, Column, Row, RowOrColumn } from "buttered-chakra";
import { Box, Heading } from "@chakra-ui/react";

// Icons - todo: move to Logos.tsx
import {
  FuseLogoSVGWhite,
  EarnLogoSVGWhite,
  Pool2LogoSVGWhite,
  TranchesLogoSVGWhite,
  StatsLogoSVGWhite,
} from "components/shared/Logos";

// Hooks
import { useTranslation } from "react-i18next";

// Types
import { StatsSubNav } from "./StatsPage";

const SubNav = ({
  isMobile,
  subNav,
  setSubNav,
}: {
  isMobile: boolean;
  subNav: StatsSubNav;
  setSubNav: Dispatch<SetStateAction<StatsSubNav>>;
}) => {
  return (
    <>
      <Column
        expand
        mainAxisAlignment="center"
        crossAxisAlignment={isMobile ? "center" : "flex-start"}
        textAlign="center"
        py={4}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          py={2}
        >
          <SubNavItem
            title="Total Overview"
            setActive={() => setSubNav(StatsSubNav.TOTAL)}
            active={subNav === StatsSubNav.TOTAL}
            subNav={StatsSubNav.TOTAL}
          />
          <SubNavItem
            title="Fuse"
            setActive={() => setSubNav(StatsSubNav.FUSE)}
            active={subNav === StatsSubNav.FUSE}
            subNav={StatsSubNav.FUSE}
          />
          <SubNavItem
            title="Earn"
            setActive={() => setSubNav(StatsSubNav.EARN)}
            subNav={StatsSubNav.EARN}
            active={subNav === StatsSubNav.EARN}
          />
          <SubNavItem
            title="Pool2"
            setActive={() => setSubNav(StatsSubNav.POOL2)}
            subNav={StatsSubNav.POOL2}
            active={subNav === StatsSubNav.POOL2}
          />
          <SubNavItem
            title="Tranches"
            setActive={() => setSubNav(StatsSubNav.TRANCHES)}
            subNav={StatsSubNav.TRANCHES}
            active={subNav === StatsSubNav.TRANCHES}
          />
        </Row>
      </Column>
    </>
  );
};

const SubNavItem = ({
  title,
  setActive,
  subNav,
  active,
}: {
  title: string;
  setActive: () => void;
  subNav: StatsSubNav;
  active: boolean;
}) => {
  const { t } = useTranslation();

  let logo;
  switch (subNav) {
    case StatsSubNav.TRANCHES:
      logo = <TranchesLogoSVGWhite />;
      break;
    case StatsSubNav.POOL2:
      logo = <Pool2LogoSVGWhite />;
      break;
    case StatsSubNav.EARN:
      logo = <EarnLogoSVGWhite />;
      break;
    case StatsSubNav.FUSE:
      logo = <FuseLogoSVGWhite />;
      break;
    case StatsSubNav.TOTAL:
      logo = <StatsLogoSVGWhite />;
      break;
  }

  return (
    <Box
      mr={7}
      height="100%"
      color={active ? "green" : "white"}
      _hover={{
        color: !active && "grey",
        cursor: "pointer",
      }}
      onClick={setActive}
    >
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        {logo}
        <Heading size="md" ml={1}>
          {t(title)}
        </Heading>
      </Row>
    </Box>
  );
};

export default SubNav;

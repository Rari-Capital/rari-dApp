import { useState } from "react";

import {
  Box,
  Heading,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Icon,
  Stack,
  StackDivider,
  Link,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";

import { PixelSize, Row } from "buttered-chakra";

//  Components
import { AccountButton } from "../AccountButton";
import { DASHBOARD_BOX_PROPS, DASHBOARD_BOX_SPACING } from "../DashboardBox";
import { AnimatedSmallLogo } from "../Logos";

import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { HeaderLink } from "./HeaderLink";
import HeaderSearchbar from "./HeaderSearchbar";

import { useIsSmallScreen } from "hooks/useIsSmallScreen";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const NewHeader = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  const [expanded, setExpanded] = useState(false);

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

      <Row
        mx={4}
        expand
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        overflowX="auto"
        overflowY="hidden"
        // transform="translate(0px, 7px)"
        height="100%"
      >
        {isMobile ? null : (
          <>
            <HeaderLink name={t("Overview")} route="/" />

            <PoolsLink ml={5} />

            <HeaderLink ml={5} name={t("Fuse")} route="/fuse" />

            <HeaderLink ml={5} name={t("Pool2")} route="/pool2" />

            <HeaderLink ml={5} name={t("Tranches")} route="/tranches" />

            {/* <HeaderLink ml={5} name={t("Vote")} route="https://vote.rari.capital" /> */}

            <GovernanceLink ml={5} />

            {isAuthed && (
              <HeaderLink ml={5} name={t("Positions")} route="/positions" />
            )}
          </>
        )}
      </Row>

      {!isMobile && <HeaderSearchbar />}

      {!isMobile ? (
        <AccountButton />
      ) : (
        <Box
          _hover={{
            color: "grey",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(true)}
        >
          <Icon aria-label="Menu" icon={<HamburgerIcon />} boxSize="35px" />
        </Box>
      )}

      {expanded && (
        <Box
          position="fixed"
          top={0}
          left={0}
          height="100vh"
          width="100vw"
          bg="black"
          zIndex={100}
          id="MENU"
        >
          <Stack>
            <StackDivider />
            <Row
              mainAxisAlignment="flex-end"
              crossAxisAlignment="center"
              px={2}
              my={4}
            >
              <Box
                height="100%"
                mr={4}
                my={4}
                opacity={0.75}
                sx={{
                  webkitTransition: "-webkit-transform .8s ease-in-out",
                  transition: `transform 6s ease-in`,
                }}
                _hover={{
                  opacity: 1,
                  transform: "rotate(3600deg)",
                  transition: "transform 30s ease-in",
                  willChange: "transform",
                  color: "grey",
                  cursor: "pointer",
                }}
                onClick={() => setExpanded(false)}
              >
                <Icon aria-label="Menu" icon={<CloseIcon />} boxSize="35px" />
              </Box>
            </Row>
            <StackDivider />
            <DropDownItem text="Overview" link="/" />
            <DropDownItem text="Pools" link="/" />
            <DropDownItem text="Fuse" link="/fuse" />
            <DropDownItem text="Pool2" link="/pool2" />
            <DropDownItem text="Tranches" link="/tranches" />
            <DropDownItem text="Positions" link="/positions" />
            <DropDownItem text="Governance" link="/" />
          </Stack>
        </Box>
      )}
    </Row>
  );
};

export const DropDownItem = ({
  text,
  link,
}: {
  text: string;
  link: string;
}) => {
  return (
    <Box
      px={4}
      py={3}
      fontSize={[5, 3]}
      fontFamily="heading"
      _hover={{ cursor: "pointer", bg: "grey" }}
    >
      <Link as={RouterLink} to={link}>
        <Heading>{text}</Heading>
      </Link>
    </Box>
  );
};

export const PoolsLink = ({ ml }: { ml?: number | string }) => {
  const { t } = useTranslation();
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text="Pools" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <SubMenuItem name={t("Stable Pool")} link="/pools/stable" />
            <SubMenuItem name={t("Yield Pool")} link="/pools/yield" />
            <SubMenuItem name={t("ETH Pool")} link="/pools/eth" />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const GovernanceLink = ({ ml }: { ml?: number | string }) => {
  const { t } = useTranslation();
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text="Governance" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <SubMenuItem
              name={t("Snapshot")}
              link="https://vote.rari.capital/"
            />
            <SubMenuItem
              name={t("Forums")}
              link="https://forums.rari.capital/"
            />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const SubMenuText = ({ text }: { text: string }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isOnThisRoute = location.pathname.includes("pools");

  return (
    <Text
      fontWeight={isOnThisRoute ? "bold" : "normal"}
      _hover={{ textDecoration: "underline" }}
    >
      {t(text)}
    </Text>
  );
};

export const SubMenuItem = ({ name, link }: { name: string; link: string }) => {
  return (
    <MenuItem _focus={{ bg: "#2b2a2a" }} _hover={{ bg: "#2b2a2a" }}>
      <Box mx="auto">
        <HeaderLink noUnderline name={name} route={link} />
      </Box>
    </MenuItem>
  );
};

export default NewHeader;

// Next
import { useRouter } from "next/router";

// Components
import {
  Box,
  Link,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import AppLink from "../AppLink";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const HeaderLink = ({
  name,
  route,
  ml,
  noUnderline,
}: {
  name: string;
  route: string;
  noUnderline?: boolean;
  ml?: number | string;
}) => {
  const router = useRouter();

  const isExternal = route.startsWith("http");

  const isOnThisRoute = router.asPath === route;

  return isExternal ? (
    <AppLink
      href={route}
      isExternal
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className={noUnderline ? "no-underline" : ""}
    >
      <Text
        fontWeight={isOnThisRoute ? "bold" : "normal"}
        textDecoration="underline"
        color={isOnThisRoute ? "purple" : "white"}
      >
        {name}
      </Text>
    </AppLink>
  ) : (
    <AppLink
      /* @ts-ignore */
      href={route}
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className={noUnderline ? "no-underline" : ""}
    >
      <Text
        fontWeight={isOnThisRoute ? "bold" : "normal"}
        textDecor={isOnThisRoute ? "underline" : ""}
        textDecorationThickness="1.5px"
        color={isOnThisRoute ? "#7065F2" : "white"}
      >
        {name}
      </Text>
    </AppLink>
  );
};

export interface DropDownLink {
  name: string;
  route: string;
}

export const DropDownLink = ({
  name,
  links,
  ml,
}: {
  name: string;
  links: DropDownLink[];
  ml?: number | string;
}) => {
  const isOnThisRoute = false;

  return (
    <Box ml={ml ?? 0} color="white">
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          fontWeight={isOnThisRoute ? "bold" : "normal"}
          color={isOnThisRoute ? "purple" : "white"}
        >
          {name}
        </MenuButton>
        <MenuList bg="black">
          {links.map((link) => (
            <DropdownItem link={link} key={link.route} />
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

const DropdownItem = ({ link }: { link: DropDownLink }) => {
  const isExternal = link.route.startsWith("http");

  return (
    <MenuItem
      as={Link}
      _hover={{ bg: "grey" }}
      href={link.route}
      isExternal={isExternal}
    >
      {link.name}
    </MenuItem>
  );
};

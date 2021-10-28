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
  MenuGroup,
  MenuDivider,
} from "@chakra-ui/react";
import AppLink from "../AppLink";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useMemo } from "react";

// Types

export enum MenuItemType {
  LINK,
  MENUGROUP,
}
export interface MenuItemInterface {
  type: MenuItemType;
  title?: string; // used only if MENUGROUP
  link?: DropDownLinkInterface; // used only if LINK
  links?: DropDownLinkInterface[]; // used only if MENUGROUP
}

export interface DropDownLinkInterface {
  name: string;
  route: string;
}

// Normal Header Link
export const HeaderLink = ({
  name,
  route,
  ml,
  noUnderline,
  ...props
}: {
  name: string;
  route: string;
  noUnderline?: boolean;
  ml?: number | string;
  [x: string]: any;
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
        {...props}
      >
        {name}
      </Text>
    </AppLink>
  ) : (
    <AppLink
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
        {...props}
      >
        {name}
      </Text>
    </AppLink>
  );
};

const splitHairs = (path: string) => path.split("/").filter((str) => !!str);

// Dropdown Header Link
// Subitems are rendered as either a MenuItem or a MenuGroup
export const DropDownLink = ({
  name,
  links,
  ml,
}: {
  name: string;
  links: MenuItemInterface[];
  ml?: number | string;
}) => {
  const router = useRouter();

  const isOnThisRoute = useMemo(
    () =>
      links.find((l) => {
        if (l.type === MenuItemType.LINK) {
          return splitHairs(router.asPath).includes(
            splitHairs(l.link!.route)[0]
          );
        } else if (l.type === MenuItemType.MENUGROUP) return false;
      }),
    [links, router]
  );

  return (
    <Box ml={ml ?? 0} color="white" zIndex={10}>
      <Menu isLazy={false}>
        <MenuButton
          p={2}
          bg="none"
          as={Button}
          rightIcon={<ChevronDownIcon />}
          fontWeight={isOnThisRoute ? "bold" : "normal"}
          textDecor={isOnThisRoute ? "underline" : ""}
          textDecorationThickness="1.5px"
          color={isOnThisRoute ? "#7065F2" : "white"}
          _hover={{ bg: "none", textDecoration: "underline" }}
          _active={{ bg: "grey.100" }}
          _focus={{ bg: "grey.200" }}
        >
          {name}
        </MenuButton>
        <MenuList bg="black">
          {links.map((link, i) => {
            // Link
            if (link.type === MenuItemType.LINK)
              return <DropdownItem link={link.link!} key={link.link!.route} />;
            // MenuGroup
            else if (link.type === MenuItemType.MENUGROUP)
              return <DropdownMenuGroup menuItem={link} key={i} />;
          })}
        </MenuList>
      </Menu>
    </Box>
  );
};

const DropdownItem = ({ link }: { link: DropDownLinkInterface }) => {
  const { route, name } = link;
  const isExternal = route.startsWith("http");
  return (
    <AppLink href={route} isExternal={isExternal}>
      <MenuItem _focus={{ bg: "grey" }} _hover={{ bg: "grey" }}>
        {name}
      </MenuItem>
    </AppLink>
  );
};

const DropdownMenuGroup = ({ menuItem }: { menuItem: MenuItemInterface }) => {
  return (
    <>
      <MenuDivider />
      <MenuGroup title={menuItem.title}>
        {menuItem.links?.map((link, i) => (
          <DropdownItem link={link} key={i} />
        ))}
      </MenuGroup>
    </>
  );
};

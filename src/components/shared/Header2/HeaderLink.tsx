// Next
import { useRouter } from "next/router";

// Components
import { Link, Text } from "@chakra-ui/react";
import AppLink from "../AppLink";

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
      <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
    </AppLink>
  ) : (
    <AppLink
      /* @ts-ignore */
      href={route}
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className={noUnderline ? "no-underline" : ""}
    >
      <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
    </AppLink>
  );
};

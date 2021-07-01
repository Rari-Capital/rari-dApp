
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
    Link,
    Text,
  } from "@chakra-ui/react";


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
    const location = useLocation();
  
    const isExternal = route.startsWith("http");
  
    const isOnThisRoute =
      location.pathname === route ||
      location.pathname.replace(/\/+$/, "") === route;
  
    return isExternal ? (
      <Link
        href={route}
        isExternal
        ml={ml ?? 0}
        whiteSpace="nowrap"
        className={noUnderline ? "no-underline" : ""}
      >
        <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
      </Link>
    ) : (
      <Link
        /* @ts-ignore */
        as={RouterLink}
        to={route}
        ml={ml ?? 0}
        whiteSpace="nowrap"
        className={noUnderline ? "no-underline" : ""}
      >
        <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
      </Link>
    );
  };
  
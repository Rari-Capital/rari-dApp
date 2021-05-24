import NextLink from "next/link";
import { Link } from "@chakra-ui/layout";
import { ReactNodeArray } from "react";

const AppLink: any = ({
  children,
  href,
  ...linkProps
}: {
  children: ReactNodeArray;
  href: string;
  linkProps: any
}) => {
  return (
    <NextLink href={href} passHref>
      <Link {...linkProps}>{children}</Link>
    </NextLink>
  );
};

export default AppLink;

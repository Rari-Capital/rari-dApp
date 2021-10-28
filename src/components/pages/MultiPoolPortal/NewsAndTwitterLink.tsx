import { ReactNode } from "react";
import { useTranslation } from "next-i18next";
import { Column, Row } from "lib/chakraUtils";

import { Box, Heading, Link, Icon } from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";

//@ts-ignore
import Marquee from "react-double-marquee";

import { useRari } from "context/RariContext";

const NewsAndTwitterLink = () => {
  const { t } = useTranslation();

  return (
    <Column
      expand
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
    >
      <Link href="https://twitter.com/RariCapital" isExternal>
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          px={4}
          py={3}
        >
          {/* <Icon as={FaTwitter} boxSize="20px" /> */}

          <Heading ml={2} size="sm">
            {t("Latest Rari News")}
          </Heading>
        </Row>
      </Link>

      <ModalDivider />

      <Column
        expand
        px={4}
        mainAxisAlignment="center"
        crossAxisAlignment="flex-start"
      >
        <NewsMarquee />
      </Column>
    </Column>
  );
};

const NewsMarquee = () => {
  const news = [
    "The first Fuse pools deployed by the Rari Capital DAO are now open for deposits/borrows in the Fuse tab!",
    "You can now earn rewards for pooling ETH and RGT on Sushiswap in the Pool2 tab.",
    "Saffron x Rari tranches are now open for deposits under the Tranches tab.",
    "We're migrating from Telegram to Discord! Join us there to talk all things Rari Capital.",
    "Individual Pool Dashboards are now live! View detailed analytics about your account and other useful metrics!",
  ];

  return (
    <Box whiteSpace="nowrap" overflow="hidden" width="100%" fontSize="sm">
      <MarqueeIfAuthed>
        {news.map((text: string) => (
          <span key={text}>
            {text}
            <NewsMarqueeSpacer />
          </span>
        ))}
      </MarqueeIfAuthed>
    </Box>
  );
};

const NewsMarqueeSpacer = () => {
  return <b> &nbsp;&nbsp;&nbsp;&nbsp;📣 &nbsp;&nbsp;&nbsp;&nbsp; </b>;
};

const MarqueeIfAuthed = ({ children }: { children: ReactNode }) => {
  const { isAuthed } = useRari();

  return isAuthed ? (
    <Marquee delay={1200} childMargin={0} speed={0.015} direction="left">
      {children}
    </Marquee>
  ) : (
    <>{children}</>
  );
};

export default NewsAndTwitterLink;

import CopyrightSpacer from "./CopyrightSpacer";
import { Link, Text } from "@chakra-ui/react";
import { Row, Column } from "utils/chakraUtils";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <>
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        py={3}
        width="100%"
        flexShrink={0}
        mt="auto"
      >
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mt={4}
          width="100%"
        >
          <Link target="_blank" href="https://docs.rari.capital/">
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Docs")}
            </Text>
          </Link>
          <Text color="white" text="sm">
            ·
          </Text>
          <Link
            target="_blank"
            href="https://www.notion.so/Rari-Capital-3d762a07d2c9417e9cd8c2e4f719e4c3"
          >
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Notion")}
            </Text>
          </Link>
          <Text color="white" text="sm">
            ·
          </Text>
          <Link
            target="_blank"
            href="https://www.notion.so/Rari-Capital-Audit-Quantstamp-December-2020-24a1d1df94894d6881ee190686f47bc7"
          >
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Audit")}
            </Text>
          </Link>
        </Row>
        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
};

export default Footer;

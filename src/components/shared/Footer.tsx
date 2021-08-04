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
          <Link isExternal href="https://docs.rari.capital/">
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Developer Docs")}
            </Text>
          </Link>

          <Text color="white" text="sm">
            ·
          </Text>

          <Link isExternal href="https://info.rari.capital">
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Learn")}
            </Text>
          </Link>

          <Text color="white" text="sm">
            ·
          </Text>

          <Link
            target="_blank"
            href="https://info.rari.capital/security/#smart-contract-audits"
          >
            <Text color="white" mx={2} text="sm" textDecoration="underline">
              {t("Audits")}
            </Text>
          </Link>
        </Row>
        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
};

export default Footer;

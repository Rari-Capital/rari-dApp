import React from "react";
import { Box, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Column } from "buttered-chakra";
import { TranchesLogoPNGWhite } from "components/shared/Logos";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { useTranslation } from "react-i18next";
import { UseEstimatedSFIReturn } from "hooks/tranches/useSaffronData";

const TranchesRow = ({
  estimatedSFI,
  daiSPrincipal,
  daiAPrincipal,
}: {
  estimatedSFI: UseEstimatedSFIReturn | undefined;
  daiSPrincipal: string | undefined;
  daiAPrincipal: string | undefined;
}) => {
  const { t } = useTranslation();

  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td textAlign="center">
        <SimpleTooltip label="Tranches" placement="right">
          <Box width="30px">
            <TranchesLogoPNGWhite boxSize="25px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td textAlign="right">
        <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
          <Box mb={3}>
            <Text> {t("DAI-S")} </Text>
          </Box>
          <Box mb={3}>
            <Text> {t("DAI-A")} </Text>
          </Box>
        </Column>
      </Td>
      <Td textAlign="right">
        <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
          <Box mb={3}>
            <Text textAlign="left"> {daiSPrincipal} DAI </Text>
          </Box>
          <Box mb={3}>
            <Text textAlign="left"> {daiAPrincipal} DAI </Text>
          </Box>
        </Column>
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td textAlign="right">
        <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
          <Box mb={3}>
            <Text textAlign="left">
              {" "}
              {estimatedSFI?.formattedAPoolSFIEarned}
            </Text>
          </Box>
          <Box mb={3}>
            <Text textAlign="left">
              {estimatedSFI?.formattedSPoolSFIEarned}
            </Text>
          </Box>
        </Column>
      </Td>
      <Td textAlign="right">
        <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
          <Box mb={3}>
            <Text>{t("N/A")}</Text>
          </Box>
        </Column>
      </Td>
    </motion.tr>
  );
};

export default TranchesRow;

import React from "react";
import { Box, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Pool2LogoPNGWhite } from "components/shared/Logos";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { useTranslation } from "react-i18next";

const Pool2Row = ({
  apr,
  earned,
  balance,
}: {
  apr: any;
  earned: any;
  balance: any;
}) => {
  const { t } = useTranslation();

  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td>
        <SimpleTooltip label={t("Pool2")} placement="right">
          <Box width="30px">
            <Pool2LogoPNGWhite boxSize="25px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td textAlign="right">{t("RGT-ETH")}</Td>
      <Td textAlign="right">
        {balance?.SLP?.toFixed(2)} {t("RGT-ETH")}
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td textAlign="right">
        {earned?.toFixed(2)} {t("RGT")}
      </Td>
      <Td textAlign="right">{t("N/A")}</Td>
    </motion.tr>
  );
};

export default Pool2Row;

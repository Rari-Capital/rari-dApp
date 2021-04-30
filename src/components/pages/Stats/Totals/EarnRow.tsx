import React from "react";
import { Box, Tr, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { EarnLogoSVGWhite } from "components/shared/Logos";
import { useTranslation } from "react-i18next";


const EarnRow = ({ poolsInfo }: { poolsInfo: any }) => {

  const { t } = useTranslation()
  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td>
        <SimpleTooltip label="Earn" placement="right">
          <Box width="30px">
            <EarnLogoSVGWhite width="26px" height="26px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td>
        {poolsInfo.map(({ poolInfo }) => (
          <Text mb={3} key={poolInfo.title}>
            {poolInfo.title}
          </Text>
        ))}
      </Td>
      <Td>
        {poolsInfo.map(({ formattedPoolBalance }, i) => (
          <Text mb={3} key={i}>
            {formattedPoolBalance}
          </Text>
        ))}
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td>
        <Text mb={3}>{t("N/A")}</Text>
        <Text mb={3}>{t("N/A")}</Text>
        <Text mb={3}>{t("N/A")}</Text>
      </Td>
      <Td>
        {poolsInfo.map(({ formattedPoolInterestEarned }, i) => (
          <Text mb={3} key={i}>
            {formattedPoolInterestEarned}
          </Text>
        ))}
      </Td>
    </motion.tr>
  );
};

export default EarnRow;

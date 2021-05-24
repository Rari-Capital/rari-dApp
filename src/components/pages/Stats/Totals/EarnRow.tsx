import { Box, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { EarnLogoPNGWhite } from "components/shared/Logos";
import { useTranslation } from "react-i18next";
import { PoolInterface } from "constants/pools";

const EarnRow = ({ poolsInfo }: { poolsInfo: any }) => {
  const { t } = useTranslation();
  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td>
        <SimpleTooltip label="Earn" placement="right">
          <Box width="30px">
            <EarnLogoPNGWhite boxSize="26px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td textAlign="right">
        {poolsInfo.map(({ poolInfo }: { poolInfo: PoolInterface }) => (
          <Text mb={3} key={poolInfo.title}>
            {poolInfo.title}
          </Text>
        ))}
      </Td>
      <Td textAlign="right">
        {poolsInfo.map(
          (
            { formattedPoolBalance }: { formattedPoolBalance: string },
            i: number
          ) => (
            <Text mb={3} key={i}>
              {formattedPoolBalance}
            </Text>
          )
        )}
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td textAlign="right">
        <Text mb={3}>{t("N/A")}</Text>
        <Text mb={3}>{t("N/A")}</Text>
        <Text mb={3}>{t("N/A")}</Text>
      </Td>
      <Td textAlign="right">
        {poolsInfo.map(
          (
            {
              formattedPoolInterestEarned,
            }: { formattedPoolInterestEarned: string },
            i: number
          ) => (
            <Text mb={3} key={i}>
              {formattedPoolInterestEarned}
            </Text>
          )
        )}
      </Td>
    </motion.tr>
  );
};

export default EarnRow;

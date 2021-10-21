// Chakra and UI
import { Column } from "utils/chakraUtils";
import { Box, Text } from "@chakra-ui/layout";
import { ConfigRow } from "components/pages/Fuse/FusePoolEditPage";
import { ModalDivider } from "components/shared/Modal";

// Rari
import { useRari } from "context/RariContext";
import { useAddAssetContext } from "context/AddAssetContext";

// Components
import IRMChart from "../IRMChart";
import { SimpleTooltip } from "components/shared/SimpleTooltip";

const Screen3 = () => {
  const { fuse } = useRari();
  const {
    curves,
    adminFee,
    tokenData,
    activeOracleModel,
    oracleAddress,
    reserveFactor,
    collateralFactor,
    interestRateModel,
    baseTokenActiveOracleName,
    shouldShowUniV3BaseTokenOracleForm,
  } = useAddAssetContext();

  return (
    <Column
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      overflowY="scroll"
      maxHeight="100%"
      height="100%"
      width="95%"
      maxWidth="100%"
      // bg="yellow"
    >
      <Box
        d="flex"
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
        height="100%"
        // bg="red"
      >
        <Column
          width="47%"
          height="90%"
          d="flex"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          alignItems="center"
          justifyContent="center"
        >
          <Text mb={1}>
            {fuse
              .identifyInterestRateModelName(interestRateModel)
              .replace("_", " ")}
          </Text>
          <IRMChart modal curves={curves} tokenData={tokenData} />
        </Column>
        <Column
          width="47%"
          height="90%"
          d="flex"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          alignItems="center"
          justifyContent="center"
        >
          <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
            <Text size="sm">Collateral Factor:</Text>
            <Text size="sm">{collateralFactor}%</Text>
          </ConfigRow>

          <ModalDivider />

          <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
            <Text size="sm">Reserve Factor:</Text>
            <Text size="sm">{reserveFactor}%</Text>
          </ConfigRow>

          <ModalDivider />

          <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
            <Text size="sm">Admin Fee: </Text>
            <Text size="sm">{adminFee}%</Text>
          </ConfigRow>

          <ModalDivider />

          <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
            <Text size="sm">Oracle:</Text>
            <SimpleTooltip label={oracleAddress}>
              <Text size="sm">{activeOracleModel.replace("_", " ")}</Text>
            </SimpleTooltip>
          </ConfigRow>

          {shouldShowUniV3BaseTokenOracleForm ? (
            <>
              <ModalDivider />
              <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
                <Text size="sm"> Base token oracle: </Text>
                <Text size="sm">{baseTokenActiveOracleName}</Text>
              </ConfigRow>
            </>
          ) : null}
        </Column>
      </Box>
    </Column>
  );
};

export default Screen3;

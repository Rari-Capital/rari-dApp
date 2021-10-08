// Chakra and UI
import { Column } from "utils/chakraUtils";
import { Box, Text } from "@chakra-ui/layout";
import { ConfigRow } from "components/pages/Fuse/FusePoolEditPage";
import { ModalDivider } from "components/shared/Modal";

// Rari
import { useRari } from "context/RariContext";

// Components
import IRMChart from "../IRMChart";

const Screen3 = ({
  curves,
  adminFee,
  tokenData,
  activeOracle,
  reserveFactor,
  collateralFactor,
  interestRateModel,
  baseTokenActiveOracle,
  shouldShowUniV3BaseTokenOracleForm,
}: {
  shouldShowUniV3BaseTokenOracleForm: boolean;
  baseTokenActiveOracle: any;
  interestRateModel: any;
  collateralFactor: number;
  reserveFactor: number;
  activeOracle: string;
  tokenData: any;
  adminFee: number;
  curves: any;
}) => {
  const { fuse } = useRari();
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
          <IRMChart modal curves={curves} tokenData={tokenData} />
          <Text>
            {fuse
              .identifyInterestRateModelName(interestRateModel)
              .replace("_", " ")}
          </Text>
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
            <Text size="sm">{activeOracle.replace("_", " ")}</Text>
          </ConfigRow>

          {shouldShowUniV3BaseTokenOracleForm ? (
            <>
              <ModalDivider />
              <ConfigRow maxHeight="35px" mainAxisAlignment="space-between">
                <Text size="sm"> Base token oracle: </Text>
                <Text size="sm">{baseTokenActiveOracle}</Text>
              </ConfigRow>
            </>
          ) : null}
        </Column>
      </Box>
    </Column>
  );
};

export default Screen3;

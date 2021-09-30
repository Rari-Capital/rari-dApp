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
  } : {
    shouldShowUniV3BaseTokenOracleForm: boolean
    baseTokenActiveOracle: any
    interestRateModel: any
    collateralFactor: number
    reserveFactor: number
    activeOracle: string
    tokenData: any,
    adminFee: number,
    curves: any
  }) => {
      const { fuse } = useRari()
    return (
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        overflowY="scroll"
        maxHeight="100%"
        height="95%"
        width="100%"
        maxWidth="100%"
      >
        <Box
          d="flex"
          maxHeight="80%"
          width="90%"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Column
            width="50%"
            height="90%"
            d="flex"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            alignItems="center"
            justifyContent="center"
          > 
  
            <ConfigRow height="35px" mainAxisAlignment="space-between">
              <Text>Collateral Factor:</Text> 
              <Text>{collateralFactor}%</Text>
            </ConfigRow>
  
            <ModalDivider/>
            
            <ConfigRow height="35px" mainAxisAlignment="space-between">
              <Text>Reserve Factor:</Text> 
              <Text>{reserveFactor}%</Text>
            </ConfigRow>
  
            <ModalDivider/>
  
            <ConfigRow height="35px" mainAxisAlignment="space-between">
              <Text>Admin Fee: </Text>
              <Text>{adminFee}%</Text>
            </ConfigRow>
            
            <ModalDivider/>
  
            <ConfigRow height="35px" mainAxisAlignment="space-between">
              <Text>Oracle:</Text>
              <Text>{activeOracle.replace('_', ' ')}</Text>
            </ConfigRow>
            
            { shouldShowUniV3BaseTokenOracleForm ?
            <>
              <ModalDivider/>
              <ConfigRow height="35px" mainAxisAlignment="space-between">
                <Text> Base token oracle:  </Text> 
                <Text>{baseTokenActiveOracle}</Text>
              </ConfigRow>
            </>
              : null
            }
            
          </Column>
          <Column
            width="50%"
            height="90%"
            d="flex"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            alignItems="center"
            justifyContent="center"
          >
            <Text>
                {fuse.identifyInterestRateModelName(interestRateModel).replace("_", " ")}
            </Text>
            <IRMChart curves={curves} tokenData={tokenData}/>
          </Column>
        </Box>
      </Column>
    );
  };

export default Screen3
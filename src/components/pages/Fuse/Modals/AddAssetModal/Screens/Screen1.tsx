// Chakra and UI
import { Column } from "utils/chakraUtils";
import { Fade } from "@chakra-ui/transition";

// Components
import OracleConfig from "../OracleConfig";
import AssetConfig from "../AssetConfig";

const Screen1 = ({
    stage,
    args,
    OracleConfigArgs,
    shouldShowUniV3BaseTokenOracleForm,
  }: {
    stage: number;
    args: any;
    OracleConfigArgs: any;
    shouldShowUniV3BaseTokenOracleForm: boolean;
  }) => {
    return (
      <>
        <Column
          mainAxisAlignment={
            shouldShowUniV3BaseTokenOracleForm
              ? "flex-start"
              : "center"
          }
          crossAxisAlignment={
            shouldShowUniV3BaseTokenOracleForm
              ? "flex-start"
              : "center"
          }
          overflowY="scroll"
          maxHeight="100%"
          height="95%"
          width="100%"
          maxWidth="100%"
          p={3}
        >
          <Fade in={stage === 1} unmountOnExit>
            <Column
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              h="100%"
            >
              <AssetConfig {...args} />
            </Column>
          </Fade>
  
          <Fade in={stage === 2} unmountOnExit>
            <Column
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              p={3}
            >
              <OracleConfig {...OracleConfigArgs} />
            </Column>
          </Fade>
        </Column>
      </>
    );
  };

export default Screen1
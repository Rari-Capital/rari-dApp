// Chakra and UI
import { Box } from "@chakra-ui/layout";
import { Row } from "utils/chakraUtils";
import { Circle } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";

const TransactionStepper = ({
    activeStep,
    tokenData,
    steps,
  }: {
    steps: string[];
    tokenData: any;
    activeStep: number;
  }) => {
    return (
      <Box
        width="100%"
        h="10%"
        d="flex"
        mb={4}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        // bg="pink"
      >
          <Row
            mainAxisAlignment="space-around"
            crossAxisAlignment="center"
            width="90%"
          >
            {steps.map((step, index) => (
              <Circle
                size="40px"
                color="white"
                key={index}
                opacity={activeStep === index ? "1" : "0.7"}
                bg={activeStep > index ? "gray" : tokenData.color}
              >
                {activeStep === index ? <Spinner /> : index + 1}
              </Circle>
            ))}
          </Row>
      </Box>
    );
  };
export default TransactionStepper
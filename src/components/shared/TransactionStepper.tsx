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
        d="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
          <Row
            mainAxisAlignment="space-around"
            crossAxisAlignment="center"
            width="90%"
            my={4}
          >
            {steps.map((step, index) => (
              <Circle
                size="50px"
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
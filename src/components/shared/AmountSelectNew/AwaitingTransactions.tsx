// Components
import { Heading, Text } from "@chakra-ui/layout";
import { HashLoader } from "react-spinners";

// Hooks
import { TokenData } from "hooks/useTokenData";

// Utils
import { Column } from "utils/chakraUtils";

const AwaitingTransactions = ({ token }: { token?: TokenData }) => (
  <Column
    mainAxisAlignment="flex-start"
    crossAxisAlignment="flex-start"
    height="100%"
    expand
  >
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4}>
      <HashLoader size={70} color={token?.color ?? "#FFF"} loading />
      <Heading mt="30px" textAlign="center" size="md">
        Check your wallet to submit the transactions
      </Heading>
      <Text fontSize="sm" mt="15px" textAlign="center">
        Do not close this tab until you submit all transactions!
      </Text>
    </Column>
  </Column>
);
export default AwaitingTransactions;

// Components
import { Heading, Text } from "@chakra-ui/layout";
import { HashLoader } from "react-spinners";

// Hooks
import { TokenData } from "hooks/useTokenData";

// Utils
import { Column } from "utils/chakraUtils";
import { useMemo } from "react";
import { AmountSelectUserAction } from "./AmountSelectNew";

const AwaitingTransactions = ({
  token,
  mode,
}: {
  token?: TokenData;
  mode: AmountSelectUserAction;
}) => {

  const renderText = useMemo(() => {
    switch (mode) {
      case AmountSelectUserAction.WAITING_FOR_LEND_APPROVAL:
        return "Approving...";
      case AmountSelectUserAction.WAITING_FOR_LEND:
        return "Waiting for Lend...";
      case AmountSelectUserAction.WAITING_FOR_BORROW:
        return "Waiting for Borrow...";
      default:
        return null;
    }
  }, [mode]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      expand
    >
      <Column
        expand
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        p={4}
      >
        <HashLoader size={70} color={token?.color ?? "#FFF"} loading />
        <Heading mt="30px" textAlign="center" size="md">
          Check your wallet to submit the transactions
        </Heading>
        <Text fontSize="sm" mt="15px" textAlign="center">
          {renderText}
        </Text>
      </Column>
    </Column>
  );
};
export default AwaitingTransactions;

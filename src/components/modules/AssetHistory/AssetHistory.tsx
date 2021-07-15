import { Heading } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";

// Utils
import { TokenData } from "hooks/useTokenData";
import { Column, Row } from "utils/chakraUtils";

const AssetHistory = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  return (
    <DashboardBox height="300px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        py={5}
        px={5}
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Heading>History</Heading>
        </Row>
      </Column>
    </DashboardBox>
  );
};

export default AssetHistory;

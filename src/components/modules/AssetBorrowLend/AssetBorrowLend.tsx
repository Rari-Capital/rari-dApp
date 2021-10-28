// Components
import { Avatar } from "@chakra-ui/avatar";
import { Box, Heading } from "@chakra-ui/layout";
import LBRW from "components/shared/AmountSelectNew/LBRW";
import DashboardBox from "components/shared/DashboardBox";
import CloseIconButton from "components/shared/Icons/CloseIconButton";
import { ModalDivider } from "components/shared/Modal";

// Utils
import { TokenData } from "hooks/useTokenData";
import { Column, Row } from "lib/chakraUtils";

const AssetBorrowLend = ({
  token,
  ...boxProps
}: {
  token?: TokenData;
  [x: string]: any;
}) => {
  return (
    <DashboardBox height="100%" w="100%" bg="" {...boxProps}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        pt={0}
      >
        <Box h="25%" w="100%">
          <Header token={token} />
        </Box>
        <ModalDivider />
        <Box h="75%" w="100%">
          <LBRW token={token} />
        </Box>
      </Column>
    </DashboardBox>
  );
};

export default AssetBorrowLend;

const Header = ({ token }: { token?: TokenData }) => (
  <Row mainAxisAlignment="center" crossAxisAlignment="center" w="100%" h="100%" py={2}>
    <Row
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      h="100%"
    >
      <Avatar src={token?.logoURL} boxSize={25} />
      <Heading ml={2} color="white" fontSize="xl">
        {token?.symbol} Lend {"&"} Borrow
      </Heading>
    </Row>
    {/* <CloseIconButton /> */}
  </Row>
);

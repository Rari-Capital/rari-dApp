import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Select,
} from "@chakra-ui/core";
import { Row, Column } from "buttered-chakra";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = (props: Props) => {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        height="290px"
        width="450px"
        backgroundColor="#121212"
        borderRadius="10px"
        border="1px"
        borderColor="#272727"
        color="#FFFFFF"
      >
        <Row
          height="65px"
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          py={4}
          pl={4}
          pr={3}
        >
          <Select
            fontSize="2xl"
            fontWeight="bold"
            variant="unstyled"
            iconSize="27px"
          >
            <option value="Deposit">Deposit</option>
            <option value="Withdraw">Withdraw</option>
          </Select>
        </Row>

        <Box h="1px" bg="#272727" />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          mt={4}
        >
          <Text fontWeight="bold" fontSize="sm">
            Deposit some crypto to start earning interest with Rari
          </Text>
          test
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;

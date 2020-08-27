import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Select,
  Button,
  Heading,
} from "@chakra-ui/core";
import { Row, Column } from "buttered-chakra";
import DashboardBox from "../shared/DashboardBox";
import SlideIn from "../shared/SlideIn";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = (props: Props) => {
  return (
    <SlideIn
      isActivted={props.isOpen}
      render={(styles) => (
        <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
          <ModalOverlay />
          <ModalContent
            {...styles}
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
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              p={4}
              height="100%"
            >
              <Text fontWeight="bold" fontSize="sm">
                Deposit some crypto to start earning interest with Rari:
              </Text>
              <DashboardBox width="100%" height="70px">
                <Row
                  p={4}
                  mainAxisAlignment="space-between"
                  crossAxisAlignment="center"
                  expand
                >
                  <Heading color="#F3B85D">0.0</Heading>
                </Row>
              </DashboardBox>

              <Button
                fontWeight="bold"
                fontSize="2xl"
                borderRadius="10px"
                width="100%"
                height="70px"
                bg="#F3B85D"
                _hover={{ transform: "scale(1.02)" }}
                _active={{ transform: "scale(0.95)" }}
              >
                Confirm
              </Button>
            </Column>
          </ModalContent>
        </Modal>
      )}
    />
  );
};

export default DepositModal;

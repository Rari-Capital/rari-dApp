import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Select,
  Button,
  Heading,
  Editable,
  EditablePreview,
  EditableInput,
} from "@chakra-ui/core";
import { Row, Column } from "buttered-chakra";
import DashboardBox from "../shared/DashboardBox";
import SlideIn from "../shared/SlideIn";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = (props: Props) => {
  const initialRef = React.useRef();

  const [stringAmount, _setStringAmount] = useState("0.0");
  const [amount, _setAmount] = useState<number | null>(0.0);

  const updateAmount = (amount: string) => {
    _setStringAmount(amount);

    const parsed = parseFloat(amount);
    if (isNaN(parsed)) {
      _setAmount(null);
    } else {
      _setAmount(parsed);
    }
  };

  return (
    <SlideIn
      isActivted={props.isOpen}
      render={(styles) => (
        <Modal
          //@ts-ignore
          initialFocusRef={initialRef}
          isOpen={props.isOpen}
          onClose={props.onClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            {...styles}
            height={{ md: "300px", xs: "350px" }}
            width={{ md: "450px", xs: "92%" }}
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
                {amount != null
                  ? amount === 0.0
                    ? "Choose which crypto you want to deposit:"
                    : "Click confirm to start earning interest with Rari:"
                  : "Please enter a valid amount to deposit:"}
              </Text>
              <DashboardBox width="100%" height="70px">
                <Row
                  p={4}
                  mainAxisAlignment="space-between"
                  crossAxisAlignment="center"
                  expand
                >
                  <Editable
                    selectAllOnFocus
                    width="50%"
                    value={stringAmount.toString()}
                    onChange={(event) => updateAmount(event)}
                    placeholder="0.0"
                    fontSize="3xl"
                    fontWeight="bold"
                    color="#F3B85D"
                  >
                    <EditablePreview />
                    <EditableInput />
                  </Editable>
                </Row>
              </DashboardBox>

              <Button
                fontWeight="bold"
                fontSize="2xl"
                borderRadius="10px"
                width="100%"
                height="70px"
                bg="#F3B85D"
                ref={initialRef}
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

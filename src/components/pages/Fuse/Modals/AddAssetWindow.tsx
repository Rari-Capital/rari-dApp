import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Text,
  Button,
} from "@chakra-ui/react";
import { Column } from "buttered-chakra";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../../../context/RariContext";
import { DASHBOARD_BOX_PROPS } from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";
import ERC20ABI from "../../../../rari-sdk/abi/ERC20.json";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const AddAssetWindow = React.memo((props: Props) => {
  const { t } = useTranslation();
  const { rari } = useRari();

  const [tokenAddress, _setTokenAddress] = useState<string>("");

  const updateTokenAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = event.target.value;
      _setTokenAddress(address);
    },

    [_setTokenAddress]
  );

  const { data: tokenData } = useQuery(
    "tokenName " + tokenAddress,
    async () => {
      if (rari.web3.utils.isAddress(tokenAddress)) {
        const token = new rari.web3.eth.Contract(ERC20ABI as any, tokenAddress);
        try {
          const name = await token.methods.name().call();
          const symbol = await token.methods.symbol().call();

          return { name, symbol };
        } catch (e) {
          return { name: "Invalid token!", symbol: null };
        }
      } else {
        return { name: "Invalid address!", symbol: null };
      }
    }
  );

  const isEmpty = tokenAddress.trim() === "";

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={props.isOpen}
      onClose={props.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <Heading fontSize="27px" my={4} textAlign="center">
          Add Asset
        </Heading>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          px={4}
          pb={4}
        >
          {!isEmpty ? (
            <Heading fontSize="25px" mt={4}>
              {tokenData?.name ?? "Loading..."}
            </Heading>
          ) : null}
          {tokenData?.symbol ? <Text>{tokenData.symbol}</Text> : null}

          <Input
            mt={4}
            width="100%"
            placeholder="Token Address: 0x00000000000000000000000000000000000000"
            height="40px"
            variant="filled"
            size="sm"
            value={tokenAddress}
            onChange={updateTokenAddress}
            {...DASHBOARD_BOX_PROPS}
            _placeholder={{ color: "#e0e0e0" }}
            _focus={{ bg: "#121212" }}
            _hover={{ bg: "#282727" }}
            bg="#282727"
          />

          <Button
            mt={4}
            fontWeight="bold"
            fontSize="2xl"
            borderRadius="10px"
            width="100%"
            height="70px"
            color="#000"
            bg="#FFF"
            _hover={{ transform: "scale(1.02)" }}
            _active={{ transform: "scale(0.95)" }}
            isLoading={!tokenData}
            isDisabled={isEmpty || tokenData?.symbol == null}
          >
            {t("Confirm")}
          </Button>
        </Column>
      </ModalContent>
    </Modal>
  );
});

export default AddAssetWindow;

import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
  Box,
} from "@chakra-ui/react";
import { Column } from "buttered-chakra";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../../../context/RariContext";
import { DASHBOARD_BOX_PROPS } from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";
import ERC20ABI from "../../../../rari-sdk/abi/ERC20.json";
import { AssetSettings } from "../FusePoolEditPage";

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
    "tokenData " + tokenAddress,
    async () => {
      if (rari.web3.utils.isAddress(tokenAddress)) {
        const token = new rari.web3.eth.Contract(ERC20ABI as any, tokenAddress);
        try {
          const name = await token.methods.name().call();
          const symbol = await token.methods.symbol().call();

          return { name, symbol };
        } catch (e) {
          return { name: t("Invalid address!"), symbol: null };
        }
      } else {
        return { name: t("Invalid address!"), symbol: null };
      }
    }
  );

  const isEmpty = tokenAddress.trim() === "";

  const [collateralFactor, setCollateralFactor] = useState(75);
  const [reserveFactor, setReserveFactor] = useState(10);

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
          pb={4}
        >
          {!isEmpty ? (
            <Heading fontSize="22px" mt={2}>
              {tokenData?.name ?? "Loading..."}
            </Heading>
          ) : null}

          <Box px={4} mt={isEmpty ? 4 : 2} mb={4} width="100%">
            <Input
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
          </Box>

          <ModalDivider />

          {tokenData?.symbol ? (
            <AssetSettings
              collateralFactor={collateralFactor}
              setCollateralFactor={setCollateralFactor}
              reserveFactor={reserveFactor}
              setReserveFactor={setReserveFactor}
              selectedAsset={tokenData.symbol}
            />
          ) : null}

          <Box px={4} mt={4} width="100%">
            <Button
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
              isDisabled={isEmpty || !tokenData?.symbol}
            >
              {t("Confirm")}
            </Button>
          </Box>
        </Column>
      </ModalContent>
    </Modal>
  );
});

export default AddAssetWindow;

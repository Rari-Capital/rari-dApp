import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
  Box,
  Image,
} from "@chakra-ui/react";
import { Column } from "buttered-chakra";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { DASHBOARD_BOX_PROPS } from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";

import { AssetSettings } from "../FusePoolEditPage";
import { useTokenData } from "../../../../hooks/useTokenData";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const AddAssetModal = React.memo((props: Props) => {
  const { t } = useTranslation();

  const [tokenAddress, _setTokenAddress] = useState<string>("");

  const updateTokenAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = event.target.value;
      _setTokenAddress(address);
    },

    [_setTokenAddress]
  );

  const tokenData = useTokenData(tokenAddress);

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
          {t("Add Asset")}
        </Heading>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          pb={4}
        >
          {!isEmpty ? (
            <>
              {tokenData?.logoURL ? (
                <Image
                  mt={4}
                  src={tokenData.logoURL}
                  boxSize="50px"
                  borderRadius="50%"
                  backgroundImage={`url(${SmallWhiteCircle})`}
                  backgroundSize="100% auto"
                />
              ) : null}
              <Heading
                my={tokenData?.symbol ? 3 : 6}
                fontSize="22px"
                color={tokenData?.color ?? "#FFF"}
              >
                {tokenData
                  ? tokenData.name ?? "Invalid Address!"
                  : "Loading..."}
              </Heading>
            </>
          ) : null}

          <Box px={4} mt={isEmpty ? 4 : 0} mb={4} width="100%">
            <Input
              width="100%"
              placeholder={t(
                "Token Address: 0x00000000000000000000000000000000000000"
              )}
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

          {tokenData?.color ? (
            <AssetSettings
              collateralFactor={collateralFactor}
              setCollateralFactor={setCollateralFactor}
              reserveFactor={reserveFactor}
              setReserveFactor={setReserveFactor}
              color={tokenData.color}
            />
          ) : null}

          <Box px={4} mt={4} width="100%">
            <Button
              fontWeight="bold"
              fontSize="2xl"
              borderRadius="10px"
              width="100%"
              height="70px"
              color={tokenData?.overlayTextColor ?? "#000"}
              bg={tokenData?.color ?? "#FFF"}
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

export default AddAssetModal;

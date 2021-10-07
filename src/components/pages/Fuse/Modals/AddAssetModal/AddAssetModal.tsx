// Chakra and UI
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import { CloseButton } from "@chakra-ui/react";
import { ModalDivider, MODAL_PROPS } from "../../../../shared/Modal";
import { Column, Center } from "utils/chakraUtils";
import SmallWhiteCircle from "../../../../../static/small-white-circle.png";
import { Heading, Box } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import { Input } from "@chakra-ui/input";
import DashboardBox, {
  DASHBOARD_BOX_PROPS,
} from "../../../../shared/DashboardBox";

// Utils
import { USDPricedFuseAsset } from "../../../../../utils/fetchFusePoolData";

// React
import { useState } from "react";

// Hooks
import { useOracleData } from "hooks/fuse/useOracleData";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import {
  ETH_TOKEN_DATA,
  useTokenData,
} from "../../../../../hooks/useTokenData";

// Components
import AssetSettings from "./AssetSettings";

const AddAssetModal = ({
  isOpen,
  poolID,
  onClose,
  poolName,
  oracleModel,
  existingAssets,
  poolOracleAddress,
  comptrollerAddress,
}: {
  comptrollerAddress: string; // Pool's comptroller address.
  poolOracleAddress: string; // Pool's oracle address.
  existingAssets: USDPricedFuseAsset[]; // List of exising assets in fuse pool.
  oracleModel: string | undefined; // Pool's oracle model name.
  poolName: string; // Used to name assets at deployment. i.e f-USDC-koan.
  poolID: string; // Fuse pool ID.
  isOpen: boolean; // Modal config.
  onClose: () => any; // Modal config.
}) => {
  const { t } = useTranslation();
  const { fuse } = useRari();

  // Will change with user's input
  const [tokenAddress, _setTokenAddress] = useState<string>("");

  // Get token data. i.e symbol, logo, etc.
  const tokenData = useTokenData(tokenAddress);

  // Get fuse pool's oracle data. i.e contract, admin, overwriting permissions
  const oracleData = useOracleData(poolOracleAddress, fuse, oracleModel);

  const isEmpty = tokenAddress.trim() === "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="slideInBottom"
      isCentered={isEmpty ? true : false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent
        {...MODAL_PROPS}
        width={isEmpty ? "25%" : "50%"}
        height={isEmpty ? "auto" : "95%"}
        maxWidth="50%"
        maxHeight="85%"
        overflowY="hidden"
      >
        <Box
          d="flex"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          px={3}
        >
          <Box flexBasis="10%" />

          <Heading my={4} ml="auto" fontSize="27px" textAlign="center">
            {t("Add Asset")}
          </Heading>

          <Box marginLeft="auto" onClick={onClose} _hover={{ color: "white" , transform: "scale(1.2);" }}>
            <CloseButton />
          </Box>
        </Box>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          pb={4}
          height="100%"
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

          <Center px={4} mt={isEmpty ? 4 : 0} width="100%">
            <Input
              width="100%"
              textAlign="center"
              placeholder={t(
                "Token Address: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              )}
              height="40px"
              variant="filled"
              size="sm"
              value={tokenAddress}
              onChange={(event) => {
                const address = event.target.value;
                _setTokenAddress(address);
              }}
              {...DASHBOARD_BOX_PROPS}
              _placeholder={{ color: "#e0e0e0" }}
              _focus={{ bg: "#121212" }}
              _hover={{ bg: "#282727" }}
              bg="#282727"
            />

            {!existingAssets.some(
              // If ETH hasn't been added:
              (asset) => asset.underlyingToken === ETH_TOKEN_DATA.address
            ) ? (
              <DashboardBox
                flexShrink={0}
                as="button"
                ml={2}
                height="40px"
                borderRadius="10px"
                px={2}
                fontSize="sm"
                fontWeight="bold"
                onClick={() => _setTokenAddress(ETH_TOKEN_DATA.address)}
              >
                <Center expand>ETH</Center>
              </DashboardBox>
            ) : null}
          </Center>

          {tokenData?.symbol ? (
            <>
              <ModalDivider mt={4} />
              <Box
                display="flex"
                height="100%"
                width="100%"
                flexDirection="column"
                justifyContent="center"
                alignContent="center"
                // bg="green"
              >
                <AssetSettings
                  mode="Adding"
                  comptrollerAddress={comptrollerAddress}
                  tokenData={tokenData}
                  tokenAddress={tokenAddress}
                  poolOracleAddress={poolOracleAddress}
                  oracleModel={oracleModel}
                  oracleData={oracleData}
                  closeModal={onClose}
                  poolName={poolName}
                  poolID={poolID}
                  existingAssets={existingAssets}
                />
              </Box>
            </>
          ) : null}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;

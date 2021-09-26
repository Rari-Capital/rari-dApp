import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
  Box,
  Text,
  Image,
  RadioGroup,
  Stack,
  Radio,
  useToast,
} from "@chakra-ui/react";

import { Column, Center, Row } from "utils/chakraUtils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import DashboardBox, {
  DASHBOARD_BOX_PROPS,
} from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";

import {
  ETH_TOKEN_DATA,
  TokenData,
  useTokenData,
} from "../../../../hooks/useTokenData";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { useRari } from "../../../../context/RariContext";

import { ConfigRow } from "../FusePoolEditPage";

import {
  createComptroller,
  createRewardsDistributor,
} from "../../../../utils/createComptroller";

const AssetSettings = ({
  tokenData,
  comptrollerAddress,
  closeModal,
  nav,
  rdAddress,
}: {
  comptrollerAddress: string;
  tokenData: TokenData;
  closeModal: () => any;
  nav: Nav;
  rdAddress: string;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();

  const [isDeploying, setIsDeploying] = useState(false);

  // Deploy new RD
  const deploy = async () => {
    try {
      const comptroller = await createComptroller(comptrollerAddress, fuse);

      if (!comptroller || !comptroller.methods._addRewardsDistributor) {
        throw new Error("Could not create Comptroller");
      }

      setIsDeploying(true);

      const deployedDistributor = await fuse.deployRewardsDistributor(
        tokenData.address,
        {
          from: address,
        }
      );

      toast({
        title: "RewardsDistributor Deployed",
        description: "RewardsDistributor for " + tokenData.symbol + " deployed",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      const rDAddress = deployedDistributor.options.address;
      console.log({ rDAddress });

      // Add distributor to pool Comptroller
      await comptroller.methods
        ._addRewardsDistributor(rDAddress)
        .send({ from: address });

      toast({
        title: "RewardsDistributor Added to Pool",
        description: "",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      setIsDeploying(false);

      closeModal();
    } catch (err) {
      console.error(err);
      setIsDeploying(false);
      toast({
        title: "Error adding RewardsDistributor",
        description: "",
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
      <ConfigRow height="35px">
        <Heading>
          {nav === Nav.CREATE
            ? "Deploy New Rewards Distributor"
            : "Add Rewards Distributor"}
        </Heading>
      </ConfigRow>

      <Box px={4} mt={4} width="100%">
        <Button
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="10px"
          width="100%"
          height="70px"
          color={tokenData.overlayTextColor! ?? "#000"}
          bg={tokenData.color! ?? "#FFF"}
          _hover={{ transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.95)" }}
          isLoading={isDeploying}
          onClick={deploy}
        >
          {t("Deploy")}
        </Button>
      </Box>
    </Column>
  );
};

const AddRewardsDistributorModal = ({
  comptrollerAddress,
  poolName,
  poolID,
  isOpen,
  onClose,
}: {
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
  isOpen: boolean;
  onClose: () => any;
}) => {
  const { fuse } = useRari();
  const { t } = useTranslation();

  const [tokenAddress, _setTokenAddress] = useState<string>(
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
  );

  const [rdAddress, setRdAddress] = useState<string>("");

  const [nav, setNav] = useState<Nav>(Nav.ADD);

  const tokenData = useTokenData(tokenAddress);

  const isEmpty = tokenAddress.trim() === "";

  useEffect(() => {
    if (rdAddress) {
      const rd = createRewardsDistributor(rdAddress, fuse);
      rd.methods
        .rewardToken()
        .call()
        .then((tokenAddr: string) => _setTokenAddress(tokenAddr));
    }
  }, [fuse, rdAddress]);

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {t("Deploy Rewards Distributor")}
        </Heading>

        <ModalDivider />

        <RadioGroup onChange={(value: Nav) => setNav(value)} value={nav}>
          <Stack direction="row">
            <Radio value={Nav.ADD}>Add</Radio>
            <Radio value={Nav.CREATE}>Create</Radio>
          </Stack>
        </RadioGroup>

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

          <Center px={4} mt={isEmpty ? 4 : 0} width="100%">
            <Input
              width="100%"
              textAlign="center"
              placeholder={
                nav === Nav.CREATE
                  ? t("Token Address: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                  : t("Rewards Distributor Address")
              }
              height="40px"
              variant="filled"
              size="sm"
              value={tokenAddress}
              onChange={(event) => {
                const address = event.target.value;

                if (nav === Nav.CREATE) {
                  _setTokenAddress(address);
                } else {
                  setRdAddress(address);
                }
              }}
              {...DASHBOARD_BOX_PROPS}
              _placeholder={{ color: "#e0e0e0" }}
              _focus={{ bg: "#121212" }}
              _hover={{ bg: "#282727" }}
              bg="#282727"
            />
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
          </Center>

          {tokenData?.symbol ? (
            <>
              <ModalDivider mt={4} />
              <AssetSettings
                comptrollerAddress={comptrollerAddress}
                tokenData={tokenData}
                closeModal={onClose}
                nav={nav}
                rdAddress={rdAddress}
              />
            </>
          ) : null}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddRewardsDistributorModal;

enum Nav {
  CREATE = "Create",
  ADD = "ADD",
}

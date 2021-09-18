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
  Select,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";

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
import { FuseIRMDemoChartOptions } from "../../../../utils/chartOptions";
import { SliderWithLabel } from "../../../shared/SliderWithLabel";
import { convertIRMtoCurve } from "../FusePoolInfoPage";

import Fuse from "../../../../fuse-sdk";
import Chart from "react-apexcharts";
import {
  ConfigRow,
  SaveButton,
  testForComptrollerErrorAndSend,
} from "../FusePoolEditPage";
import { useQuery, useQueryClient } from "react-query";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../shared/SimpleTooltip";
import BigNumber from "bignumber.js";
import { createComptroller } from "../../../../utils/createComptroller";
import { testForCTokenErrorAndSend } from "./PoolModal/AmountSelect";

import { handleGenericError } from "../../../../utils/errorHandling";
import { USDPricedFuseAsset } from "../../../../utils/fetchFusePoolData";
import LogRocket from "logrocket";

const formatPercentage = (value: number) => value.toFixed(0) + "%";

const AssetSettings = ({
  poolName,
  poolID,
  tokenData,
  comptrollerAddress,
  closeModal,
}: {
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  tokenData: TokenData;
  closeModal: () => any;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();

  const [isDeploying, setIsDeploying] = useState(false);
  const deploy = async () => {
    try {
      const comptroller = await createComptroller(comptrollerAddress, fuse);

      if (!comptroller || !comptroller.methods._addRewardsDistributor) {
        throw new Error("Could not create Comptroller");
      }
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
      

      const rDAddress =  deployedDistributor.options.address;
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
      closeModal();
    } catch (err) {
      console.error(err);
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
        <Heading>Rewards Distributor</Heading>
      </ConfigRow>

      <ModalDivider />

      <ModalDivider />

      <ModalDivider />

      <ModalDivider />

      {/* 
      <Box
        height="170px"
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {curves ? (
          <Chart
            options={
              {
                ...FuseIRMDemoChartOptions,
                colors: ["#FFFFFF", tokenData.color! ?? "#282727"],
              } as any
            }
            type="line"
            width="100%"
            height="100%"
            series={[
              {
                name: "Borrow Rate",
                data: curves.borrowerRates,
              },
              {
                name: "Deposit Rate",
                data: curves.supplierRates,
              },
            ]}
          />
        ) : curves === undefined ? (
          <Center expand color="#FFF">
            <Spinner my={8} />
          </Center>
        ) : (
          <Center expand color="#FFFFFF">
            <Text>
              {t("No graph is available for this asset's interest curves.")}
            </Text>
          </Center>
        )}
      </Box> */}

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
          {t("Confirm")}
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
  const { t } = useTranslation();

  const [tokenAddress, _setTokenAddress] = useState<string>("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2");
  const [nav, setNav] = useState<Nav>(Nav.ADD);

  const tokenData = useTokenData(tokenAddress);

  const isEmpty = tokenAddress.trim() === "";

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

        <NavTabs setNav={setNav} />

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
                poolName={poolName}
                poolID={poolID}
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

const navItems = [Nav.ADD, Nav.CREATE];

const NavTabs = ({ setNav }: { setNav: (navItem: Nav) => any }) => {
  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="nav"
      isFitted
      my={4}
      onChange={(i: number) => setNav(navItems[i])}
      size="sm"
      width="50px"
    >
      <TabList borderRadius="2xl" bg="#252626" display="flex">
        <Row mainAxisAlignment="center" crossAxisAlignment="center">
          {navItems.map((nav) => {
            return (
              <Tab key={nav} borderRadius="2xl" _hover={{ color: "green.200" }}>
                <Text
                  fontSize="xs"
                  color="white"
                  _hover={{ color: "green.200" }}
                >
                  {nav}
                </Text>
              </Tab>
            );
          })}
        </Row>
      </TabList>
    </Tabs>
  );
};

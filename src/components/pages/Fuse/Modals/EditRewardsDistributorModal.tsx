import { useEffect, useState } from "react";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useClipboard,
} from "@chakra-ui/react";

import { Column, Center, Row } from "utils/chakraUtils";
import { useTranslation } from "react-i18next";

import { ModalDivider, MODAL_PROPS } from "components/shared/Modal";
import { AdminAlert } from "components/shared/AdminAlert";

import { useTokenData } from "hooks/useTokenData";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { useRari } from "context/RariContext";

import Fuse from "../../../../fuse-sdk";

import { handleGenericError } from "../../../../utils/errorHandling";
import {
  FusePoolData,
  USDPricedFuseAsset,
} from "../../../../utils/fetchFusePoolData";
import { useTokenBalance } from "hooks/useTokenBalance";
import DashboardBox from "../../../shared/DashboardBox";
import { createRewardsDistributor } from "utils/createComptroller";
import { RewardsDistributor } from "hooks/rewards/useRewardsDistributorsForPool";
import { shortAddress } from "utils/shortAddress";

// Styles
const activeStyle = { bg: "#FFF", color: "#000" };
const noop = () => {};

const useRewardsDistributorInstance = (rDAddress: string) => {
  const { fuse } = useRari();
  return createRewardsDistributor(rDAddress, fuse);
};

// Gets Reward Speed of CToken
const useRewardSpeedsOfCToken = (rDAddress: any, cTokenAddress?: string) => {
  const { fuse } = useRari();
  const instance = createRewardsDistributor(rDAddress, fuse);

  const [supplySpeed, setSupplySpeed] = useState<any>();
  const [borrowSpeed, setBorrowSpeed] = useState<any>();

  useEffect(() => {
    if (!cTokenAddress) return;

    // Get Supply reward speed for this CToken from the mapping
    instance.methods
      .compSupplySpeeds(cTokenAddress)
      .call()
      .then((result: any) => {
        console.log({ result });
        setSupplySpeed(result);
      });

    // Get Borrow reward speed for this CToken from the mapping
    instance.methods
      .compBorrowSpeeds(cTokenAddress)
      .call()
      .then((result: any) => {
        console.log({ result });
        setBorrowSpeed(result);
      });
  }, [instance, fuse, cTokenAddress]);

  return [supplySpeed, borrowSpeed];
};

const EditRewardsDistributorModal = ({
  rewardsDistributor,
  pool,
  isOpen,
  onClose,
}: {
  rewardsDistributor: RewardsDistributor;
  pool: FusePoolData;
  isOpen: boolean;
  onClose: () => any;
}) => {
  const { t } = useTranslation();

  const { address, fuse } = useRari();
  const rewardsDistributorInstance = useRewardsDistributorInstance(
    rewardsDistributor.address
  );
  const tokenData = useTokenData(rewardsDistributor.rewardToken);
  const isAdmin = address === rewardsDistributor.admin;

  //   Balances
  const { data: balanceERC20 } = useTokenBalance(
    rewardsDistributor.rewardToken,
    rewardsDistributor.address
  );

  const { data: myBalance } = useTokenBalance(rewardsDistributor.rewardToken);

  const toast = useToast();

  // Inputs
  const [sendAmt, setSendAmt] = useState<number>(0);

  const [supplySpeed, setSupplySpeed] = useState<number>(0.001);
  const [borrowSpeed, setBorrowSpeed] = useState<number>(0.001);

  //  Loading states
  const [fundingDistributor, setFundingDistributor] = useState(false);
  const [changingSpeed, setChangingSpeed] = useState(false);
  const [changingBorrowSpeed, setChangingBorrowSpeed] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<
    USDPricedFuseAsset | undefined
  >(pool?.assets[0] ?? undefined);

  //   RewardsSpeeds
  const [supplySpeedForCToken, borrowSpeedForCToken] = useRewardSpeedsOfCToken(
    rewardsDistributor.address,
    selectedAsset?.cToken
  );

  const { hasCopied, onCopy } = useClipboard(rewardsDistributor?.address ?? "");

  // Sends tokens to distributor
  const fundDistributor = async () => {
    // Create ERC20 instance of rewardToken
    const token = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"]
          .abi
      ),
      rewardsDistributor.rewardToken
    );

    setFundingDistributor(true);
    try {
      await token.methods
        .transfer(
          rewardsDistributor.address,
          Fuse.Web3.utils
            .toBN(sendAmt)
            .mul(Fuse.Web3.utils.toBN(10).pow(Fuse.Web3.utils.toBN(18)))
        )
        .send({
          from: address,
        });

      setFundingDistributor(false);
    } catch (err) {
      handleGenericError(err, toast);
      setFundingDistributor(false);
    }
  };

  //   Adds LM to supply side of a CToken in this fuse pool
  const changeSupplySpeed = async () => {
    try {
      if (!isAdmin) throw new Error("User is not admin of this Distributor!");

      setChangingSpeed(true);

      await rewardsDistributorInstance.methods
        ._setCompSupplySpeed(
          selectedAsset?.cToken,
          Fuse.Web3.utils.toBN(supplySpeed * 1e18) // set supplySpeed to 0.001e18 for now
        )
        .send({ from: address });

      setChangingSpeed(false);
    } catch (err) {
      handleGenericError(err, toast);
      setChangingSpeed(false);
    }
  };

  //   Adds LM to supply side of a CToken in this fuse pool
  const changeBorrowSpeed = async () => {
    try {
      if (!isAdmin) throw new Error("User is not admin of this Distributor!");

      setChangingBorrowSpeed(true);

      await rewardsDistributorInstance.methods
        ._setCompBorrowSpeed(
          selectedAsset?.cToken,
          Fuse.Web3.utils.toBN(borrowSpeed * 1e18) // set supplySpeed to 0.001e18 for now
        )
        .send({ from: address });

      setChangingBorrowSpeed(false);
    } catch (err) {
      handleGenericError(err, toast);
      setChangingBorrowSpeed(false);
    }
  };

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
          {t("Edit Rewards Distributor")}
        </Heading>

        <ModalDivider />

        {/*  RewardToken data */}
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={4}
        >
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
              {tokenData ? tokenData.name ?? "Invalid Address!" : "Loading..."}
            </Heading>
            <Text>
              {balanceERC20 && tokenData && tokenData.decimals
                ? (
                    parseFloat(balanceERC20?.toString()) /
                    10 ** tokenData.decimals
                  ).toFixed(3)
                : 0}{" "}
              {tokenData?.symbol}
            </Text>
            <Text onClick={onCopy}>
              Contract: {shortAddress(rewardsDistributor.address)}{" "}
              {hasCopied && "Copied!"}
            </Text>
          </>
        </Column>

        <AdminAlert
          isAdmin={isAdmin}
          mt={2}
          isNotAdminText="You are not the admin of this RewardsDistributor. Only the admin can configure rewards."
        />

        {/* Basic Info  */}
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          py={4}
        >
          {/* <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>Address: {rewardsDistributor.address}</Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>Admin: {rewardsDistributor.admin}</Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text>
              Balance:{" "}
              {balanceERC20 ? parseFloat(balanceERC20?.toString()) / 1e18 : 0}{" "}
              {tokenData?.symbol}
            </Text>
          </Row> */}

          <ModalDivider />

          {/* Fund distributor */}
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            p={4}
          >
            <Heading fontSize={"lg"}> Fund Distributor </Heading>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              mt={1}
            >
              <NumberInput
                step={0.1}
                min={0}
                onChange={(valueString) => {
                  console.log({ valueString });
                  setSendAmt(parseFloat(valueString));
                }}
              >
                <NumberInputField
                  width="100%"
                  textAlign="center"
                  placeholder={"0 " + tokenData?.symbol}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                onClick={fundDistributor}
                bg="black"
                disabled={fundingDistributor}
              >
                {fundingDistributor ? <Spinner /> : "Send"}
              </Button>
            </Row>
            <Text mt={1}>
              Your balance:{" "}
              {myBalance
                ? (parseFloat(myBalance?.toString()) / 1e18).toFixed(2)
                : 0}{" "}
              {tokenData?.symbol}
            </Text>
          </Column>

          {/* Add or Edit a CToken to the Distributor */}

          {pool.assets.length ? (
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              p={4}
            >
              <Heading fontSize={"lg"}> Manage CToken Rewards </Heading>
              {/* Select Asset */}
              <Row
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                mt={1}
              >
                {pool.assets.map(
                  (asset: USDPricedFuseAsset, index: number, array: any[]) => {
                    return (
                      <Box
                        pr={index === array.length - 1 ? 4 : 2}
                        key={asset.cToken}
                        flexShrink={0}
                      >
                        <DashboardBox
                          as="button"
                          onClick={() => setSelectedAsset(asset)}
                          {...(asset.cToken === selectedAsset?.cToken
                            ? activeStyle
                            : noop)}
                        >
                          <Center expand px={4} py={1} fontWeight="bold">
                            {asset.underlyingSymbol}
                          </Center>
                        </DashboardBox>
                      </Box>
                    );
                  }
                )}
              </Row>

              {/* Change Supply Speed */}
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                py={3}
              >
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
                  <NumberInput
                    step={0.1}
                    min={0}
                    onChange={(supplySpeed) => {
                      console.log({ supplySpeed });
                      setSupplySpeed(parseFloat(supplySpeed));
                    }}
                  >
                    <NumberInputField
                      width="100%"
                      textAlign="center"
                      placeholder={"0 " + tokenData?.symbol}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    onClick={changeSupplySpeed}
                    bg="black"
                    disabled={changingSpeed || !isAdmin}
                  >
                    {changingSpeed ? <Spinner /> : "Set"}
                  </Button>
                </Row>
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
                  <Text>
                    Supply Speed:{" "}
                    {(parseFloat(supplySpeedForCToken) / 1e18).toFixed(4)}
                  </Text>
                </Row>
              </Column>

              {/* Change Borrow Speed */}
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                py={3}
              >
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
                  <NumberInput
                    step={0.1}
                    min={0}
                    onChange={(borrowSpeed) => {
                      console.log({ borrowSpeed });
                      setBorrowSpeed(parseFloat(borrowSpeed));
                    }}
                  >
                    <NumberInputField
                      width="100%"
                      textAlign="center"
                      placeholder={"0 " + tokenData?.symbol}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <Button
                    onClick={changeBorrowSpeed}
                    bg="black"
                    disabled={changingBorrowSpeed || !isAdmin}
                  >
                    {changingBorrowSpeed ? <Spinner /> : "Set"}
                  </Button>
                </Row>
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
                  <Text>
                    Borrow Speed:{" "}
                    {(parseFloat(borrowSpeedForCToken) / 1e18).toFixed(2)}
                  </Text>
                </Row>
              </Column>
            </Column>
          ) : (
            <Center p={4}>
              <Text fontWeight="bold">
                Add CTokens to this pool to configure their rewards.
              </Text>
            </Center>
          )}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default EditRewardsDistributorModal;

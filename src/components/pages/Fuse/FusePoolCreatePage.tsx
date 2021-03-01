import {
  Heading,
  Select,
  Text,
  Switch,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Column, Center, Row } from "buttered-chakra";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";

import DashboardBox from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { SliderWithLabel } from "../../shared/SliderWithLabel";

import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";

const formatPercentage = (value: number) => value.toFixed(0) + "%";

const FusePoolCreatePage = React.memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const { isAuthed } = useRari();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1150px"}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar />

        <FuseTabBar />

        <PoolConfiguration />
      </Column>
    </>
  );
});

export default FusePoolCreatePage;

const PoolConfiguration = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { fuse, address } = useRari();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [oracle, setOracle] = useState("");
  const [whitelist, setWhitelisted] = useState(false);

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(1.08);

  const [isCreating, setIsCreating] = useState(false);

  const onDeploy = async () => {
    if (name === "") {
      toast({
        title: "Error!",
        description: "You must specify a name for your Fuse pool!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (oracle === "") {
      toast({
        title: "Error!",
        description: "You must select an oracle.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    setIsCreating(true);

    const maxAssets = "20";

    const bigCloseFactor = new BigNumber(closeFactor)
      .multipliedBy(1e18)
      .dividedBy(100)
      .toFixed(0);

    const bigLiquidationIncentive = new BigNumber(liquidationIncentive)
      .multipliedBy(1e18)
      .toFixed(0);

    let reporter = null;
    if (oracle === "UniswapAnchoredView") {
      reporter = prompt(
        "What reporter address would you like to use? (Coinbase Pro is the default.)",
        "0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC"
      );
    }

    await fuse.deployPool(
      name,
      whitelist,
      bigCloseFactor,
      maxAssets,
      bigLiquidationIncentive,
      oracle,
      { reporter },
      { from: address }
    );

    toast({
      title: "Your pool has been deployed!",
      description: "You may now add assets to it.",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });

    // TODO
    let id = 0;

    navigate(`/fuse/pool/${id}/edit`);
    setIsCreating(false);
  };

  return (
    <>
      <DashboardBox width="100%" mt={4}>
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Heading size="sm" px={4} py={4}>
            {t("Create Pool")}
          </Heading>

          <ModalDivider />

          <OptionRow>
            <Text fontWeight="bold" mr={4}>
              {t("Name:")}
            </Text>
            <Input
              width="20%"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <Text fontWeight="bold" mr={4}>
              {t("Oracle")}
            </Text>
            <Select
              width="20%"
              value={oracle}
              onChange={(event) => setOracle(event.target.value)}
              placeholder="Select Oracle"
            >
              <option value="0x026838c33c05cace3495bfe51261f7d942fddf8a">
                ChainlinkPriceOracle
              </option>
            </Select>
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <Text fontWeight="bold">{t("Whitelisted")}:</Text>

            <Switch
              h="20px"
              isChecked={whitelist}
              onChange={() => setWhitelisted((past) => !past)}
              className="black-switch"
              colorScheme="#121212"
            />
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <Text fontWeight="bold">{t("Close Factor")}:</Text>

            <SliderWithLabel
              value={closeFactor}
              setValue={setCloseFactor}
              formatValue={formatPercentage}
            />
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <Text fontWeight="bold">{t("Liquidation Incentive")}:</Text>

            <SliderWithLabel
              value={liquidationIncentive}
              setValue={setLiquidationIncentive}
              formatValue={(num) => num.toFixed(2)}
              min={1}
              step={0.01}
              max={1.5}
            />
          </OptionRow>
        </Column>
      </DashboardBox>

      <DashboardBox
        width="100%"
        height="60px"
        mt={4}
        py={3}
        fontSize="xl"
        as="button"
        onClick={onDeploy}
      >
        <Center expand fontWeight="bold">
          {isCreating ? <Spinner /> : t("Create")}
        </Center>
      </DashboardBox>
    </>
  );
};

const OptionRow = ({ children }: { children: ReactNode }) => {
  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
      overflowX="auto"
    >
      {children}
    </Row>
  );
};

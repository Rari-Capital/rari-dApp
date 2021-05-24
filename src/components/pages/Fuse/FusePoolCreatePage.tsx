import {
  Heading,
  Select,
  Text,
  Switch,
  Input,
  Spinner,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { Column, Center, Row } from "buttered-chakra";
import { memo, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";

import DashboardBox from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { SliderWithLabel } from "../../shared/SliderWithLabel";

import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";
import Fuse from "../../../fuse-sdk";
import { AddIcon, QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../shared/SimpleTooltip";

import { handleGenericError } from "../../../utils/errorHandling";
import LogRocket from "logrocket";

const formatPercentage = (value: number) => value.toFixed(0) + "%";

const FusePoolCreatePage = memo(() => {
  const isMobile = useIsSemiSmallScreen();

  const { isAuthed } = useRari();

  return (
    <>
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
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [whitelist, setWhitelist] = useState<string[]>([]);

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

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

    // 50% -> 0.5 * 1e18
    const bigCloseFactor = new BigNumber(closeFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive = new BigNumber(liquidationIncentive)
      .dividedBy(100)
      .plus(1)
      .multipliedBy(1e18)
      .toFixed(0);

    let reporter = null;

    try {
      const [poolAddress] = await fuse.deployPool(
        name,
        isWhitelisted,
        bigCloseFactor,
        maxAssets,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        isWhitelisted ? whitelist : null
      );

      toast({
        title: "Your pool has been deployed!",
        description: "You may now add assets to it.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      const event = (
        await fuse.contracts.FusePoolDirectory.getPastEvents("PoolRegistered", {
          fromBlock: (await fuse.web3.eth.getBlockNumber()) - 10,
          toBlock: "latest",
        })
      ).filter(
        (event) =>
          event.returnValues.pool.comptroller.toLowerCase() ===
          poolAddress.toLowerCase()
      )[0];

      LogRocket.track("Fuse-CreatePool");

      let id = event.returnValues.index;
      navigate(`/fuse/pool/${id}/edit`);
    } catch (e) {
      handleGenericError(e, toast);
    }
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
              {t("Name")}
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
              <option
                className="black-bg-option"
                value={
                  Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES
                    .ChainlinkPriceOracle
                }
              >
                ChainlinkPriceOracle
              </option>
            </Select>
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <SimpleTooltip
              label={t(
                "If enabled you will be able to limit the ability to supply to the pool to a select group of addresses. The pool will not show up on the 'all pools' list."
              )}
            >
              <Text fontWeight="bold">
                {t("Whitelisted")} <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <Switch
              h="20px"
              isChecked={isWhitelisted}
              onChange={() => {
                setIsWhitelisted((past) => !past);
                // Add the user to the whitelist by default
                if (whitelist.length === 0) {
                  setWhitelist([address]);
                }
              }}
              className="black-switch"
              colorScheme="#121212"
            />
          </OptionRow>

          {isWhitelisted ? (
            <WhitelistInfo
              whitelist={whitelist}
              addToWhitelist={(user) => {
                setWhitelist((past) => [...past, user]);
              }}
              removeFromWhitelist={(user) => {
                setWhitelist((past) =>
                  past.filter(function (item) {
                    return item !== user;
                  })
                );
              }}
            />
          ) : null}

          <ModalDivider />

          <OptionRow>
            <SimpleTooltip
              label={t(
                "The percent, ranging from 0% to 100%, of a liquidatable account's borrow that can be repaid in a single liquidate transaction. If a user has multiple borrowed assets, the closeFactor applies to any single borrowed asset, not the aggregated value of a user’s outstanding borrowing. Compound's close factor is 50%."
              )}
            >
              <Text fontWeight="bold">
                {t("Close Factor")} <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <SliderWithLabel
              value={closeFactor}
              setValue={setCloseFactor}
              formatValue={formatPercentage}
              min={5}
              max={90}
            />
          </OptionRow>

          <ModalDivider />

          <OptionRow>
            <SimpleTooltip
              label={t(
                "The additional collateral given to liquidators as an incentive to perform liquidation of underwater accounts. For example, if the liquidation incentive is 10%, liquidators receive an extra 10% of the borrowers collateral for every unit they close. Compound's liquidation incentive is 8%."
              )}
            >
              <Text fontWeight="bold">
                {t("Liquidation Incentive")} <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <SliderWithLabel
              value={liquidationIncentive}
              setValue={setLiquidationIncentive}
              formatValue={formatPercentage}
              min={0}
              max={50}
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

const OptionRow = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: any;
}) => {
  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
      overflowX="auto"
      {...others}
    >
      {children}
    </Row>
  );
};

export const WhitelistInfo = ({
  whitelist,
  addToWhitelist,
  removeFromWhitelist,
}: {
  whitelist: string[];
  addToWhitelist: (user: string) => any;
  removeFromWhitelist: (user: string) => any;
}) => {
  const [_whitelistInput, _setWhitelistInput] = useState("");
  const { t } = useTranslation();
  const { fuse } = useRari();
  const toast = useToast();

  return (
    <>
      <OptionRow my={0} mb={4}>
        <Input
          width="100%"
          value={_whitelistInput}
          onChange={(event) => _setWhitelistInput(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
          _placeholder={{ color: "#FFF" }}
        />
        <IconButton
          flexShrink={0}
          aria-label="add"
          icon={<AddIcon />}
          width="35px"
          ml={2}
          bg="#282727"
          color="#FFF"
          borderWidth="1px"
          backgroundColor="transparent"
          onClick={() => {
            if (
              fuse.web3.utils.isAddress(_whitelistInput) &&
              !whitelist.includes(_whitelistInput)
            ) {
              addToWhitelist(_whitelistInput);
              _setWhitelistInput("");
            } else {
              toast({
                title: "Error!",
                description:
                  "This is not a valid ethereum address (or you have already entered this address)",
                status: "error",
                duration: 2000,
                isClosable: true,
                position: "top-right",
              });
            }
          }}
          _hover={{}}
          _active={{}}
        />
      </OptionRow>
      {whitelist.length > 0 ? (
        <Text mb={4} ml={4} width="100%">
          <b>{t("Already added:")} </b>
          {whitelist.map((user, index, array) => (
            <Text
              key={user}
              className="underline-on-hover"
              as="button"
              onClick={() => removeFromWhitelist(user)}
            >
              {user}
              {array.length - 1 === index ? null : <>,&nbsp;</>}
            </Text>
          ))}
        </Text>
      ) : null}
    </>
  );
};

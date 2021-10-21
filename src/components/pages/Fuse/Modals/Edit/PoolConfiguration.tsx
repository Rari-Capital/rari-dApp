import OraclesTable from "./OraclesTable";

import { Box, Center, Heading, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { DASHBOARD_BOX_PROPS } from "components/shared/DashboardBox";
import { ModalDivider } from "components/shared/Modal";
import { useRari } from "context/RariContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "utils/chakraUtils";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import {
  ConfigRow,
  SaveButton,
  testForComptrollerErrorAndSend,
} from "../../FusePoolEditPage";
import AssetSettings from "../AddAssetModal/AssetSettings";
import { useParams } from "react-router";
import { useQueryClient } from "react-query";
import { useToast } from "@chakra-ui/toast";
import { useExtraPoolInfo } from "../../FusePoolInfoPage";
import useOraclesForPool from "hooks/fuse/useOraclesForPool";
import { createComptroller, createUnitroller } from "utils/createComptroller";
import LogRocket from "logrocket";
import { handleGenericError } from "utils/errorHandling";
import BigNumber from "bignumber.js";
import { CTokenAvatarGroup } from "components/shared/CTokenIcon";
import { WhitelistInfo } from "../../FusePoolCreatePage";
import { Input } from "@chakra-ui/input";
import { SliderWithLabel } from "components/shared/SliderWithLabel";
import { Switch } from "@chakra-ui/switch";

const formatPercentage = (value: number) => value.toFixed(0) + "%";


const PoolConfiguration = ({
  assets,
  comptrollerAddress,
  oracleAddress,
}: {
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
  oracleAddress: string;
}) => {
  const { t } = useTranslation();
  const { poolId } = useParams();

  const { fuse, address } = useRari();

  const queryClient = useQueryClient();
  const toast = useToast();

  const data = useExtraPoolInfo(comptrollerAddress, oracleAddress);

  // Maps underlying to oracle
  const oraclesMap = useOraclesForPool(
    oracleAddress,
    assets.map((asset: USDPricedFuseAsset) => asset.underlyingToken) ?? []
  );

  const changeWhitelistStatus = async (enforce: boolean) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistEnforcement(enforce),
        address,
        ""
      );

      LogRocket.track("Fuse-ChangeWhitelistStatus");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const addToWhitelist = async (newUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const newList = [...data!.whitelist, newUser];

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistStatuses(
          newList,
          Array(newList.length).fill(true)
        ),
        address,
        ""
      );

      LogRocket.track("Fuse-AddToWhitelist");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const removeFromWhitelist = async (removeUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const whitelist = data!.whitelist;
    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistStatuses(
          whitelist,
          whitelist.map((user: string) => user !== removeUser)
        ),
        address,
        ""
      );

      LogRocket.track("Fuse-RemoveFromWhitelist");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const [admin, setAdmin] = useState(address);

  const revokeRights = async () => {
    const unitroller = createUnitroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        unitroller.methods._toggleAdminRights(false),
        address,
        ""
      );

      LogRocket.track("Fuse-RevokeRights");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const acceptAdmin = async () => {
    const unitroller = createUnitroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        unitroller.methods._acceptAdmin(),
        address,
        ""
      );

      LogRocket.track("Fuse-AcceptAdmin");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateAdmin = async () => {
    const unitroller = createUnitroller(comptrollerAddress, fuse);

    if (!fuse.web3.utils.isAddress(admin)) {
      handleGenericError({ message: "This is not a valid address." }, toast);
      return;
    }

    try {
      await testForComptrollerErrorAndSend(
        unitroller.methods._setPendingAdmin(admin),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateAdmin");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

  const scaleCloseFactor = (_closeFactor: number) => {
    return _closeFactor / 1e16;
  };

  const scaleLiquidationIncentive = (_liquidationIncentive: number) => {
    return _liquidationIncentive / 1e16 - 100;
  };

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setCloseFactor(scaleCloseFactor(data.closeFactor));
      setLiquidationIncentive(
        scaleLiquidationIncentive(data.liquidationIncentive)
      );
      setAdmin(data.admin);
    }
  }, [data]);

  const updateCloseFactor = async () => {
    // 50% -> 0.5 * 1e18
    const bigCloseFactor = new BigNumber(closeFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setCloseFactor(bigCloseFactor),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateCloseFactor");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateLiquidationIncentive = async () => {
    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive = new BigNumber(liquidationIncentive)
      .dividedBy(100)
      .plus(1)
      .multipliedBy(1e18)
      .toFixed(0);

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setLiquidationIncentive(bigLiquidationIncentive),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateLiquidationIncentive");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="sm" px={4} py={4}>
        {t("Pool {{num}} Configuration", { num: poolId })}
      </Heading>

      <ModalDivider />

      {data ? (
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          width="100%"
          overflowY="auto"
        >
          <ConfigRow>
            <Text fontWeight="bold" mr={2}>
              {t("Assets:")}
            </Text>

            {assets.length > 0 ? (
              <>
                <CTokenAvatarGroup
                  tokenAddresses={assets.map(
                    ({ underlyingToken }) => underlyingToken
                  )}
                  popOnHover={true}
                />

                <Text ml={2} flexShrink={0}>
                  {assets.map(({ underlyingSymbol }, index, array) => {
                    return (
                      underlyingSymbol +
                      (index !== array.length - 1 ? " / " : "")
                    );
                  })}
                </Text>
              </>
            ) : (
              <Text>{t("None")}</Text>
            )}
          </ConfigRow>

          <ModalDivider />

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
          >
            <ConfigRow>
              <Text fontWeight="bold">{t("Whitelist")}:</Text>

              <Switch
                ml="auto"
                h="20px"
                isDisabled={!data.upgradeable}
                isChecked={data.enforceWhitelist}
                onChange={() => {
                  changeWhitelistStatus(!data.enforceWhitelist);
                }}
                className="black-switch"
                colorScheme="#121212"
              />
            </ConfigRow>

            {data.enforceWhitelist ? (
              <WhitelistInfo
                whitelist={data.whitelist}
                addToWhitelist={addToWhitelist}
                removeFromWhitelist={removeFromWhitelist}
              />
            ) : null}

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t("Admin")}:</Text>

              {admin.toLowerCase() !== data.admin.toLowerCase() ? (
                <SaveButton ml={3} onClick={updateAdmin} />
              ) : address.toLowerCase() === data.pendingAdmin.toLowerCase() ? (
                <SaveButton
                  ml={3}
                  onClick={acceptAdmin}
                  fontSize="xs"
                  altText={t("Become Admin")}
                />
              ) : data.adminHasRights &&
                address.toLowerCase() === data.admin.toLowerCase() ? (
                <SaveButton
                  ml={3}
                  onClick={revokeRights}
                  fontSize="xs"
                  altText={t("Revoke Rights")}
                />
              ) : null}

              <Input
                isDisabled={
                  !data.adminHasRights ||
                  data.admin?.toLowerCase() !== address.toLowerCase()
                }
                ml="auto"
                width="320px"
                height="100%"
                textAlign="center"
                variant="filled"
                size="sm"
                value={admin}
                onChange={(event) => {
                  const address = event.target.value;
                  setAdmin(address);
                }}
                {...DASHBOARD_BOX_PROPS}
                _placeholder={{ color: "#e0e0e0" }}
                _focus={{ bg: "#121212" }}
                _hover={{ bg: "#282727" }}
                bg="#282727"
              />
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t("Close Factor")}:</Text>

              {data && scaleCloseFactor(data.closeFactor) !== closeFactor ? (
                <SaveButton onClick={updateCloseFactor} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={closeFactor}
                setValue={setCloseFactor}
                formatValue={formatPercentage}
                min={5}
                max={90}
              />
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t("Liquidation Incentive")}:</Text>

              {data &&
              scaleLiquidationIncentive(data.liquidationIncentive) !==
                liquidationIncentive ? (
                <SaveButton onClick={updateLiquidationIncentive} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={liquidationIncentive}
                setValue={setLiquidationIncentive}
                formatValue={formatPercentage}
                min={0}
                max={50}
              />
            </ConfigRow>
            <ModalDivider />

            {/* OraclesTable */}
            <OraclesTable oraclesMap={oraclesMap} data={data} />

          </Column>
        </Column>
      ) : (
        <Center expand>
          <Spinner my={8} />
        </Center>
      )}
    </Column>
  );
};

export default PoolConfiguration;

import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Input } from "@chakra-ui/input";
import { Box, Heading } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import BigNumber from "bignumber.js";
import DashboardBox from "components/shared/DashboardBox";

// Hooks
import { useRari } from "context/RariContext";
import { useCallback } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

// Utils
import { Row } from "utils/chakraUtils";
import { handleGenericError } from "utils/errorHandling";
import {
  FusePoolData,
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";
import { fetchMaxAmount } from "utils/inputUtils";

// Types
import { AmountSelectMode, AmountSelectUserAction } from "../AmountSelectNew";

// todo: Restrict modes used to LEND and BORROW
const FuseAmountInput = ({
  asset,
  fusePool,
  mode,
  value,
  updateAmount,
  updateAsset,
}: {
  asset?: USDPricedFuseAssetWithTokenData;
  fusePool?: FusePoolData;
  mode: AmountSelectMode;
  value: string;
  updateAmount: (value: string) => any;
  updateAsset?: (assetAddress: string) => any;
}) => {

  return (
    <DashboardBox width="100%" height="70px">
      <Row
        p={4}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
      >
        <AmountInputField
          color={asset?.tokenData?.color ?? "#FFF"}
          value={value}
          updateAmount={updateAmount}
        />

        {fusePool && asset && (
          <TokenNameAndMaxButton
            comptrollerAddress={fusePool.comptroller}
            mode={mode}
            logoURL={
              asset?.tokenData?.logoURL ??
              "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
            }
            asset={asset}
            pool={fusePool}
            updateAmount={updateAmount}
            updateAsset={updateAsset}
          />
        )}
      </Row>
    </DashboardBox>
  );
};

export default FuseAmountInput;

// UI for the actual input field
export const AmountInputField = ({
  value,
  updateAmount,
  color,
}: {
  value: string;
  color: string;
  updateAmount: (value: string) => any;
}) => {
  return (
    <Input
      type="number"
      inputMode="decimal"
      fontSize="2xl"
      fontWeight="bold"
      variant="unstyled"
      _placeholder={{ color }}
      placeholder="0.0"
      value={value}
      color={color}
      onChange={(event) => updateAmount(event.target.value)}
      mr={4}
    />
  );
};

// Token Name and Max Button
export const TokenNameAndMaxButton = ({
  logoURL,
  pool,
  asset,
  mode,
  comptrollerAddress,
  updateAmount,
  updateAsset,
}: {
  logoURL: string;
  pool: FusePoolData;
  asset: USDPricedFuseAssetWithTokenData;
  mode: AmountSelectMode;
  comptrollerAddress: string;
  updateAmount: (newAmount: string) => any;
  updateAsset?: (assetAddress: string) => any;
}) => {
  const { fuse, address } = useRari();
  const toast = useToast();
  const { t } = useTranslation();
  const [isMaxLoading, setIsMaxLoading] = useState(false);

  // If we defined an updateAsset handler, then we want to show the assets dropdown
  const shouldShowAssetsDropdown = !!updateAsset;

  // Set value to max
  const setToMax = async () => {
    setIsMaxLoading(true);

    try {
      const maxBN = await fetchMaxAmount(
        mode,
        fuse,
        address,
        asset,
        comptrollerAddress
      );

      if (maxBN!.isNeg() || maxBN!.isZero()) {
        updateAmount("");
      } else {
        const str = new BigNumber(maxBN!.toString())
          .div(10 ** asset.underlyingDecimals)
          .toFixed(18)
          // Remove trailing zeroes
          .replace(/\.?0+$/, "");

        updateAmount(str);
      }

      setIsMaxLoading(false);
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      flexShrink={0}
      color="white"
    >
      {shouldShowAssetsDropdown ? (
        <AssetsDropDown
          assets={pool.assets as USDPricedFuseAssetWithTokenData[]}
          currentAsset={asset}
          updateAsset={updateAsset!}
        />
      ) : (
        <AssetNameAndIcon asset={asset} />
      )}

      <Button
        ml={1}
        height="28px"
        width="58px"
        bg="transparent"
        border="2px"
        borderRadius="8px"
        borderColor="#272727"
        fontSize="sm"
        fontWeight="extrabold"
        _hover={{}}
        _active={{}}
        onClick={setToMax}
        isLoading={isMaxLoading}
      >
        {t("MAX")}
      </Button>
    </Row>
  );
};

const AssetNameAndIcon = ({
  asset,
}: {
  asset: USDPricedFuseAssetWithTokenData;
}) => {
  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <Box height="20px" width="20px" mb="2px" mr={1.5}>
        <Image
          width="100%"
          height="100%"
          borderRadius="50%"
          backgroundImage={`url(/static/small-white-circle.png)`}
          src={asset?.tokenData?.logoURL ?? null}
          alt={asset?.underlyingSymbol}
        />
      </Box>
      <Heading fontSize="20px" mr={2} flexShrink={0}>
        {asset.underlyingSymbol}
      </Heading>
    </Row>
  );
};

const AssetsDropDown = ({
  assets,
  currentAsset,
  updateAsset,
}: {
  assets: USDPricedFuseAssetWithTokenData[];
  currentAsset: USDPricedFuseAssetWithTokenData;
  updateAsset: (assetAddress: string) => any;
}) => {
  const handleClick = useCallback(
    (asset: USDPricedFuseAssetWithTokenData) => {
      updateAsset(asset.underlyingToken);
    },
    [updateAsset]
  );

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<FaChevronDown />}>
        <AssetNameAndIcon asset={currentAsset} />
      </MenuButton>
      <MenuList maxHeight="200px" overflowY="scroll">
        {assets.map((asset: USDPricedFuseAssetWithTokenData) => (
          <MenuItem
            _hover={{ bg: "grey.400" }}
            color="black"
            onClick={() => handleClick(asset)}
          >
            {asset.underlyingSymbol}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

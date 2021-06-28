import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Input } from "@chakra-ui/input";
import { Box, Heading } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import BigNumber from "bignumber.js";
import DashboardBox from "components/shared/DashboardBox";

// Hooks
import { useRari } from "context/RariContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
}: {
  asset?: USDPricedFuseAssetWithTokenData;
  fusePool?: FusePoolData;
  mode: AmountSelectMode;
  value: string;
  updateAmount: (value: string) => any;
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
              asset.tokenData?.logoURL ??
              "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
            }
            asset={asset}
            updateAmount={updateAmount}
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
  updateAmount: (value: string) => any;
  color: string;
}) => {
  return (
    <Input
      type="number"
      inputMode="decimal"
      fontSize="3xl"
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
  updateAmount,
  logoURL,
  asset,
  mode,
  comptrollerAddress,
}: {
  logoURL: string;
  asset: USDPricedFuseAssetWithTokenData;
  mode: AmountSelectMode;
  comptrollerAddress: string;
  updateAmount: (newAmount: string) => any;
}) => {
  const { fuse, address } = useRari();
  const toast = useToast();
  const { t } = useTranslation();
  const [isMaxLoading, setIsMaxLoading] = useState(false);

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
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <Box height="25px" width="25px" mb="2px" mr={2}>
          <Image
            width="100%"
            height="100%"
            borderRadius="50%"
            backgroundImage={`url(/static/small-white-circle.png)`}
            src={logoURL}
            alt=""
          />
        </Box>
        <Heading fontSize="24px" mr={2} flexShrink={0}>
          {asset.underlyingSymbol}
        </Heading>
      </Row>

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

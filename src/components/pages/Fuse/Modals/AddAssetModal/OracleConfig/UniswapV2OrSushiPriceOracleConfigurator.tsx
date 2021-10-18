// Chakra and UI
import { Button, Text, Select, Checkbox } from "@chakra-ui/react";
import { Row } from "utils/chakraUtils";
import { DASHBOARD_BOX_PROPS } from "../../../../../shared/DashboardBox";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../../../shared/SimpleTooltip";

// React
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Hooks
import { useSushiOrUniswapV2Pairs } from "hooks/fuse/useOracleData";
import { useAddAssetContext } from "context/AddAssetContext";

// Utils
import { smallUsdFormatter, shortUsdFormatter } from "utils/bigUtils";

const UniswapV2OrSushiPriceOracleConfigurator = ({
  type,
}: {
  // Asset's Address. i.e DAI, USDC

  // Either SushiSwap or Uniswap V2
  type: string;
}) => {
  const { t } = useTranslation();

  // This will be used to index whitelistPools array (fetched from the graph.)
  // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
  const [activePool, setActivePair] = useState<string>("");

  // Checks if user has started the TWAP bot.
  const [checked, setChecked] = useState<boolean>(false);

  // Will store oracle response. This helps us know if its safe to add it to Master Price Oracle
  const [checkedStepTwo, setCheckedStepTwo] = useState<boolean>(false);

  const { tokenAddress, setOracleAddress, setUniV3BaseTokenAddress } =
    useAddAssetContext();

  // Get pair options from sushiswap and uniswap
  const { SushiPairs, SushiError, UniV2Pairs, univ2Error } =
    useSushiOrUniswapV2Pairs(tokenAddress);

  // This is where we conditionally store data depending on type.
  // Uniswap V2 or SushiSwap
  const Pairs = type === "UniswapV2" ? UniV2Pairs : SushiPairs;
  const Error = type === "UniswapV2" ? univ2Error : SushiError;

  // Will update active pair, set oracle address and base token.
  const updateInfo = (value: string) => {
    const pair = Pairs[value];
    setActivePair(value);
    setOracleAddress(pair.id);
    setUniV3BaseTokenAddress(
      pair.token1.id === tokenAddress ? pair.token0.id : pair.token1.id
    );
  };

  // If pairs are still being fetched, if theres and error or if there are none, return nothing.
  if (Pairs === undefined || Error || Pairs === null) return null;

  return (
    <>
      <Row
        crossAxisAlignment="center"
        mainAxisAlignment="space-between"
        width="260px"
        my={3}
      >
        <Checkbox isChecked={checked} onChange={() => setChecked(!checked)}>
          <Text fontSize="xs" align="center">
            Using this type of oracle requires you to run a TWAP bot.
          </Text>
        </Checkbox>
      </Row>

      {checked ? (
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={3}
        >
          <Button colorScheme="teal">Check</Button>

          <Text fontSize="xs" align="center">
            After deploying your oracle, you have to wait about 15 - 25 minutes
            for the oracle to be set.
          </Text>
        </Row>
      ) : null}

      {true ? (
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={2}
        >
          <SimpleTooltip
            label={t(
              "This field will determine which pool your oracle reads from. Its safer with more liquidity."
            )}
          >
            <Text fontWeight="bold">
              {t("Pool:")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>
          <Select
            {...DASHBOARD_BOX_PROPS}
            ml={2}
            mb={2}
            borderRadius="7px"
            _focus={{ outline: "none" }}
            width="180px"
            placeholder={
              activePool.length === 0 ? t("Choose Pool") : activePool
            }
            value={activePool}
            disabled={!checked}
            onChange={(event) => {
              updateInfo(event.target.value);
            }}
          >
            {typeof Pairs !== undefined
              ? Object.entries(Pairs).map(([key, value]: any[]) =>
                  value.totalSupply !== null &&
                  value.totalSupply !== undefined &&
                  value.totalSupply >= 100 ? (
                    <option
                      className="black-bg-option"
                      value={key}
                      key={value.id}
                    >
                      {`${value.token0.symbol} / ${
                        value.token1.symbol
                      } (${shortUsdFormatter(value.totalSupply)})`}
                    </option>
                  ) : null
                )
              : null}
          </Select>
        </Row>
      ) : null}

      {activePool.length > 0 ? (
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={2}
        >
          <SimpleTooltip label={t("TVL in pool as of this moment.")}>
            <Text fontWeight="bold">
              {t("Liquidity:")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>
          <h1>
            {activePool !== ""
              ? smallUsdFormatter(Pairs[activePool].totalSupply)
              : null}
          </h1>
        </Row>
      ) : null}
    </>
  );
};
export default UniswapV2OrSushiPriceOracleConfigurator;

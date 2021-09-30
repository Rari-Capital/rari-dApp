// Chakra and UI
import {
    Text,
    Select,
    Link,
  } from "@chakra-ui/react";
  import {
    Row,
  } from "utils/chakraUtils";
  import {
    DASHBOARD_BOX_PROPS,
  } from "../../../../../shared/DashboardBox";
  import { QuestionIcon } from "@chakra-ui/icons";
  import { SimpleTooltip } from "../../../../../shared/SimpleTooltip";
  
  // React
  import { useState } from "react";
  import { useTranslation } from "react-i18next";
  import { useQuery } from "react-query";
  
  // Axios
  import axios from "axios";

  // Utils
  import { smallUsdFormatter, shortUsdFormatter } from "utils/bigUtils";
  

const UniswapV3PriceOracleConfigurator = ({
    setFeeTier,
    tokenAddress,
    _setOracleAddress,
    setUniV3BaseToken,
  }: {
    // Assets Address. i.e DAI, USDC
    tokenAddress: string;
  
    // Will update the oracle address that we use when adding, editing an asset
    _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;
  
    // Will update BaseToken address. This is used in component: AssetSettings (see top of this page).
    // Helps us know if oracle has a price feed for this asset. If it doesn't we need to add one.
    setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;
  
    // Will update FeeTier Only used to deploy Uniswap V3 Twap Oracle. It holds fee tier from Uniswap's token pair pool.
    setFeeTier: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    const { t } = useTranslation();
  
    // This will be used to index whitelistPools array (fetched from the graph.)
    // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
    const [activePool, setActivePool] = useState<string>("");
  
    // We get a list of whitelistedPools from uniswap-v3's the graph.
    const { data: liquidity, error } = useQuery(
      "UniswapV3 pool liquidity for " + tokenAddress,
      async () =>
        (
          await axios.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
            {
              query: `{
              token(id:"${tokenAddress}") {
                whitelistPools {
                  id,
                  feeTier,
                  totalValueLockedUSD,
                  token0 {
                    symbol,
                    id
                  },
                  token1 {
                    symbol,
                    id
                  }
                }
              }
            }`,
            }
          )
        ).data,
      { refetchOnMount: false }
    );
  
    // When user selects an option this function will be called.
    // Active pool, fee Tier, and base token are updated and we set the oracle address to the address of the pool we chose.
    const updateBoth = (value: string) => {
      const uniPool = liquidity.data.token.whitelistPools[value];
  
      setActivePool(value);
      setFeeTier(uniPool.feeTier);
      _setOracleAddress(uniPool.id);
      setUniV3BaseToken(
        uniPool.token0.id === tokenAddress ? uniPool.token1.id : uniPool.token0.id
      );
    };
  
    // If liquidity is undefined, theres an error or theres no token found return nothing.
    if (liquidity === undefined || error || liquidity.data.token === null)
      return null;
  
    // Sort whitelisted pools by TVL. Greatest to smallest. Greater TVL is safer for users so we show it first.
    const liquiditySorted = liquidity.data.token.whitelistPools.sort(
      (a: any, b: any): any =>
        parseInt(a.totalValueLockedUSD) > parseInt(b.totalValueLockedUSD) ? -1 : 1
    );
  
    return (
      <>
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="100%"
          my={2}
          px={4}
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
            width="180px"
            borderRadius="7px"
            value={activePool}
            _focus={{ outline: "none" }}
            placeholder={activePool.length === 0 ? t("Choose Pool") : activePool}
            onChange={(event) => {
              updateBoth(event.target.value);
            }}
          >
            {typeof liquidity !== undefined
              ? Object.entries(liquiditySorted).map(([key, value]: any[]) =>
                  value.totalValueLockedUSD !== null &&
                  value.totalValueLockedUSD !== undefined &&
                  value.totalValueLockedUSD >= 100 ? (
                    <option
                      className="black-bg-option"
                      value={key}
                      key={value.id}
                    >
                      {`${value.token0.symbol} / ${
                        value.token1.symbol
                      } (${shortUsdFormatter(value.totalValueLockedUSD)})`}
                    </option>
                  ) : null
                )
              : null}
          </Select>
        </Row>
  
        {activePool.length > 0 ? (
          <>
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
                  ? smallUsdFormatter(
                      liquidity.data.token.whitelistPools[activePool]
                        .totalValueLockedUSD
                    )
                  : null}
              </h1>
            </Row>
            <Row
              crossAxisAlignment="center"
              mainAxisAlignment="space-between"
              width="260px"
              my={4}
            >
              <SimpleTooltip
                label={t(
                  "The fee percentage for the pool on Uniswap (0.05%, 0.3%, 1%)"
                )}
              >
                <Text fontWeight="bold">
                  {t("Fee Tier:")} <QuestionIcon ml={1} mb="4px" />
                </Text>
              </SimpleTooltip>
              <Text>
                %
                {activePool !== ""
                  ? liquidity.data.token.whitelistPools[activePool].feeTier /
                    10000
                  : null}
              </Text>
            </Row>
            <Row
              crossAxisAlignment="center"
              mainAxisAlignment="center"
              width="260px"
              my={0}
            >
              <Link
                href={`https://info.uniswap.org/#/pools/${liquidity.data.token.whitelistPools[activePool].id}`}
                isExternal
              >
                Visit Pool in Uniswap
              </Link>
            </Row>
          </>
        ) : null}
      </>
    );
  };

export default UniswapV3PriceOracleConfigurator
import React, { useState, CSSProperties } from "react";
import {
  Input,
  Image,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  Box,
  Spinner,
} from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Row, Column, Center } from "buttered-chakra";
import { useTokenBalance } from "../../../hooks/useTokenBalance";

import BigWhiteCircle from "../../../static/big-white-circle.png";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from "react-i18next";
import { ModalDivider, ModalTitleWithCloseButton } from "../../shared/Modal";
import { usdFormatter } from "../../../utils/bigUtils";
import { Pool, usePoolType } from "../../../context/PoolContext";
import { useRari } from "../../../context/RariContext";
import { useQuery } from "react-query";
import { Mode } from ".";
import { getSDKPool, poolHasDivergenceRisk } from "../../../utils/poolUtils";
import { SearchIcon } from "@chakra-ui/icons";
import Rari from "../../../rari-sdk/index";
import { ETH_TOKEN_DATA, TokenData } from "../../../hooks/useTokenData";

interface LiteTokenData {
  address: string;
  contract: any;
  decimals: number;
  symbol: string;
  name: string;
}

const fetchTokens = (rari: Rari) => {
  //TODO: Support pool specific assets, etc
  return rari.getAllTokens() as Promise<LiteTokenData[]>;
};

const TokenSelect = ({
  onSelectToken: _onSelectToken,
  onClose,
  mode,
}: {
  mode: Mode;
  onClose: () => any;
  onSelectToken: (symbol: string) => any;
}) => {
  const [searchNeedle, setSearchNeedle] = useState("");

  const poolType = usePoolType();

  const { rari } = useRari();

  const {
    data: noSlippageCurrencies,
    isLoading: isNoSlippageCurrenciesLoading,
  } = useQuery(poolType + " noSlippageCurrencies", async () => {
    let noSlippageCurrencies: string[];

    if (poolType === Pool.ETH) {
      noSlippageCurrencies = ["ETH"];
    } else {
      noSlippageCurrencies = await getSDKPool({
        rari,
        pool: poolType,
      }).deposits.getDirectDepositCurrencies();
    }

    if (noSlippageCurrencies.length === 0) {
      return ["None"];
    }

    return noSlippageCurrencies;
  });

  const { data: tokenList } = useQuery(poolType + " tokenList", async () => {
    const allTokens = await fetchTokens(rari);

    if (poolType === Pool.ETH) {
      return [ETH_TOKEN_DATA];
    }

    return searchNeedle === ""
      ? Object.values(allTokens).sort((a, b) => {
          // First items shown last, last items shown at the top!
          const priorityCurrencies = [
            "sUSD",
            "WETH",
            "ETH",
            "DAI",
            "mUSD",
            "USDT",
            "USDC",
          ];

          if (
            priorityCurrencies.indexOf(a.symbol!) <
            priorityCurrencies.indexOf(b.symbol!)
          ) {
            return 1;
          }
          if (
            priorityCurrencies.indexOf(a.symbol!) >
            priorityCurrencies.indexOf(b.symbol!)
          ) {
            return -1;
          }

          return 0;
        })
      : Object.values(allTokens).filter((token) =>
          token.symbol!.toLowerCase().startsWith(searchNeedle.toLowerCase())
        );
  });

  const { t } = useTranslation();

  return (
    <Fade>
      <ModalTitleWithCloseButton text={t("Select A Token")} onClose={onClose} />
      <ModalDivider />
      <Box px={4}>
        <InputGroup mb={2}>
          <InputLeftElement
            ml={-1}
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            variant="flushed"
            roundedLeft="0"
            placeholder={t("Try searching for 'USDC'")}
            focusBorderColor="#FFFFFF"
            value={searchNeedle}
            onChange={(event) => setSearchNeedle(event.target.value)}
          />
        </InputGroup>
      </Box>

      <Box px={4}>
        No Slippage:{" "}
        <b>
          {isNoSlippageCurrenciesLoading
            ? " Loading..."
            : noSlippageCurrencies!.map((token: string, index: number) => {
                return (
                  token +
                  (index === (noSlippageCurrencies as string[]).length - 1
                    ? ""
                    : ", ")
                );
              })}
        </b>
      </Box>

      <Box
        pt={2}
        px={4}
        width="100%"
        height={{
          md: poolHasDivergenceRisk(poolType) ? "182px" : "157px",
          base: poolHasDivergenceRisk(poolType) ? "210px" : "170px",
        }}
      >
        {tokenList ? (
          <TokenList
            mode={mode}
            tokens={tokenList}
            onClick={(address) => {
              _onSelectToken(address);
              onClose();
            }}
          />
        ) : (
          <Center expand>
            <Spinner />
          </Center>
        )}
      </Box>
    </Fade>
  );
};

export default TokenSelect;

const TokenRow = ({
  data: { tokens, onClick, mode },
  index,
  style,
}: {
  data: {
    tokens: LiteTokenData[];
    onClick: (symbol: string) => any;
    mode: Mode;
  };
  index: number;
  style: CSSProperties;
}) => {
  const token = tokens[index];

  const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
    token.address!
  );

  const tokenData = useTokenBalance(address);

  return (
    <div style={style}>
      <Row
        flexShrink={0}
        as="button"
        onClick={() => onClick(token.address!)}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        <Box height="45px" width="45px" borderRadius="50%" mr={2}>
          <Image
            width="100%"
            height="100%"
            borderRadius="50%"
            backgroundImage={`url(${BigWhiteCircle})`}
            src={token.logoURL!}
            alt=""
          />
        </Box>
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Heading fontSize="20px" lineHeight="1.25rem" color={token.color!}>
            {token.symbol}
          </Heading>
          <Text fontWeight="thin" fontSize="15px">
            {mode === Mode.DEPOSIT
              ? isBalanceLoading
                ? "?"
                : usdFormatter(
                    parseFloat(balance!.toString()) / 10 ** token.decimals!
                  ).replace("$", "")
              : null}
          </Text>
        </Column>
      </Row>
    </div>
  );
};

const TokenList = ({
  tokens,
  onClick,
  mode,
}: {
  tokens: LiteTokenData[];
  onClick: (symbol: string) => any;
  mode: Mode;
}) => {
  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <List
            height={height}
            width={width}
            itemCount={tokens.length}
            itemKey={(index, data) => data.tokens[index]}
            itemSize={55}
            itemData={{
              tokens,
              onClick,
              mode,
            }}
            overscanCount={3}
          >
            {TokenRow}
          </List>
        );
      }}
    </AutoSizer>
  );
};

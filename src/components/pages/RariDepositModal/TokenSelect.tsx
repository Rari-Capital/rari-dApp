import React, { useState, CSSProperties, useCallback, useMemo } from "react";
import {
  Input,
  Image,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  Box,
} from "@chakra-ui/react";
import { tokens } from "../../../utils/tokenUtils";
import { Fade } from "react-awesome-reveal";
import { Row, Column } from "buttered-chakra";
import { useTokenBalance } from "../../../hooks/useTokenBalance";

import BigWhiteCircle from "../../../static/big-white-circle.png";
import {
  FixedSizeList as List,
  areEqual,
  ListItemKeySelector,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from "react-i18next";
import { ModalDivider, ModalTitleWithCloseButton } from "../../shared/Modal";
import { usdFormatter } from "../../../utils/bigUtils";
import { Pool, usePoolType } from "../../../context/PoolContext";

import { Mode } from ".";
import { poolHasDivergenceRisk } from "../../../utils/poolUtils";
import { SearchIcon } from "@chakra-ui/icons";
import { useNoSlippageCurrencies } from "../../../hooks/useNoSlippageCurrencies";

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

  const noSlippageCurrencies = useNoSlippageCurrencies(poolType);

  const tokenKeys = (() => {
    if (poolType === Pool.ETH) {
      return ["ETH"];
    }

    return searchNeedle === ""
      ? Object.keys(tokens).sort((a, b) => {
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

          if (priorityCurrencies.indexOf(a) < priorityCurrencies.indexOf(b)) {
            return 1;
          }
          if (priorityCurrencies.indexOf(a) > priorityCurrencies.indexOf(b)) {
            return -1;
          }

          return 0;
        })
      : Object.keys(tokens).filter((symbol) =>
          symbol.toLowerCase().startsWith(searchNeedle.toLowerCase())
        );
  })();

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
          {!noSlippageCurrencies
            ? " Loading..."
            : noSlippageCurrencies.map((token: string, index: number) => {
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
        <TokenList
          mode={mode}
          tokenKeys={tokenKeys}
          onClick={(symbol) => {
            _onSelectToken(symbol);
            onClose();
          }}
        />
      </Box>
    </Fade>
  );
};

export default TokenSelect;

const TokenRow = React.memo(
  ({
    data: { tokenKeys, onClick, mode },
    index,
    style,
  }: {
    data: {
      tokenKeys: string[];
      onClick: (symbol: string) => any;
      mode: Mode;
    };
    index: number;
    style: CSSProperties;
  }) => {
    const token = tokens[tokenKeys[index]];

    const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
      token.address
    );

    return (
      <div style={style}>
        <Row
          flexShrink={0}
          as="button"
          onClick={() => onClick(token.symbol)}
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
              src={token.logoURL}
              alt=""
            />
          </Box>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
          >
            <Heading fontSize="20px" lineHeight="1.25rem" color={token.color}>
              {token.symbol}
            </Heading>
            <Text fontWeight="thin" fontSize="15px">
              {mode === Mode.DEPOSIT
                ? isBalanceLoading
                  ? "?"
                  : usdFormatter(
                      parseFloat(balance!.toString()) / 10 ** token.decimals
                    ).replace("$", "")
                : null}
            </Text>
          </Column>
        </Row>
      </div>
    );
  },
  areEqual
);

const TokenList = React.memo(
  ({
    tokenKeys,
    onClick,
    mode,
  }: {
    tokenKeys: string[];
    onClick: (symbol: string) => any;
    mode: Mode;
  }) => {
    const itemData = useMemo(
      () => ({
        tokenKeys,
        onClick,
        mode,
      }),
      [tokenKeys, onClick, mode]
    );

    const getItemKey = useCallback<ListItemKeySelector>(
      (index, data) => data.tokenKeys[index],
      []
    );

    return (
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              height={height}
              width={width}
              itemCount={tokenKeys.length}
              itemKey={getItemKey}
              itemSize={55}
              itemData={itemData}
              overscanCount={3}
            >
              {TokenRow}
            </List>
          );
        }}
      </AutoSizer>
    );
  }
);

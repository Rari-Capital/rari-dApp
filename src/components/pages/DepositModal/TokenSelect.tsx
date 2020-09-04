import React, { useState, useMemo, useCallback, CSSProperties } from "react";
import {
  Input,
  Image,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  Box,
  Icon,
  CloseButton,
} from "@chakra-ui/core";
import { tokens } from "../../../utils/tokenUtils";
import { Fade } from "react-awesome-reveal";
import { Row, Column } from "buttered-chakra";
import { useTokenBalance } from "../../../hooks/useTokenBalance";
import { formatBig } from "../../../utils/bigUtils";
import BigWhiteCircle from "../../../static/big-white-circle.png";
import { FixedSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const TokenSelect = React.memo(
  (props: { onClose: () => any; onSelectToken: (symbol: string) => any }) => {
    const [searchNeedle, setSearchNeedle] = useState("");

    const tokenKeys = useMemo(
      () =>
        searchNeedle === ""
          ? Object.keys(tokens)
          : Object.keys(tokens).filter((symbol) =>
              symbol.toLowerCase().startsWith(searchNeedle.toLowerCase())
            ),
      [searchNeedle]
    );

    const onSearch = useCallback(
      (event: any) => setSearchNeedle(event.target.value),
      [setSearchNeedle]
    );

    return (
      <Fade>
        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={4}
        >
          <Box width="32px" />
          <Heading fontSize="27px">Select a Token</Heading>
          <CloseButton onClick={props.onClose} />
        </Row>
        <Box h="1px" bg="#272727" />
        <InputGroup mb={2} mx={4}>
          <InputLeftElement
            ml={-1}
            children={<Icon name="search" color="gray.300" />}
          />
          <Input
            variant="flushed"
            roundedLeft="0"
            placeholder="Try searching for 'DAI'"
            focusBorderColor="#FFFFFF"
            value={searchNeedle}
            onChange={onSearch}
          />
        </InputGroup>

        <Box pt={1} px={4} width="100%" height="180px">
          <TokenList tokenKeys={tokenKeys} onClick={props.onSelectToken} />
        </Box>
      </Fade>
    );
  }
);

export default TokenSelect;

const TokenRow = React.memo(
  ({
    data: { tokenKeys, onClick },
    index,
    style,
  }: {
    data: { tokenKeys: string[]; onClick: (symbol: string) => any };
    index: number;
    style: CSSProperties;
  }) => {
    const token = tokens[tokenKeys[index]];

    const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
      token
    );

    const selectToken = useCallback(() => onClick(token.symbol), [
      token.symbol,
      onClick,
    ]);

    return (
      <div style={style}>
        <Row
          flexShrink={0}
          as="button"
          onClick={selectToken}
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
            <Heading fontSize="20px" color={token.color}>
              {token.symbol}
            </Heading>
            <Text fontWeight="thin" fontSize="15px">
              {isBalanceLoading ? "$?" : formatBig(balance!)}
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
  }: {
    tokenKeys: string[];
    onClick: (symbol: string) => any;
  }) => {
    const sortedKeys = useMemo(() => {
      return [...tokenKeys].sort();
    }, [tokenKeys]);

    const itemData = useMemo(
      () => ({
        tokenKeys: sortedKeys,
        onClick,
      }),
      [sortedKeys, onClick]
    );

    return (
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              height={height}
              width={width}
              itemCount={sortedKeys.length}
              itemKey={(index, data) => data.tokenKeys[index]}
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

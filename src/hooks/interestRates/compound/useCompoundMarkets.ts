import { useEffect, useState, useRef } from "react";

// Hooks
import { useRari } from "context/RariContext";

// ABIs
import CErc20 from "./CErc20";

// Types
import { MarketInfo } from "../types";

// Util/Misc
import { ETH_TOKEN_DATA } from "hooks/useTokenData";

type CTokenData = {
  cTokenAddress: string; // address of underlying token
  marketInfo: MarketInfo;
};

// I replaced a call to the getAllMarkets() method in
// Comptroller because it was returning data that
// got in the way of getting interest rates, namely
// the duplicate "cWBTC" symbol caused by the existence
// of cWBTC and cWBTC2. Unfortunately, the cWBTC2 has the
// same symbol as its predecessor. For that reason, for
// now, I will be using this hard-coded list of cTokens.
const CTOKEN_LIST = [
  "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E", // cBAT
  "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4", // cCOMP
  "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
  "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC", // cSAI
  "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", // cETH
  "0xFAce851a4921ce59e912d19329929CE6da6EB0c7", // cLINK
  "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1", // cREP
  "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86", // cTUSD
  "0x35A18000230DA775CAc24873d00Ff85BccdeD550", // cUNI
  "0x39AA39c021dfbaE8faC545936693aC917d5E7563", // cUSDC
  "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9", // cUSDT
  "0xccF4429DB6322D5C611ee964527D42E5d685DD6a", // cWBTC2
  "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407", // cZRX
];

export default function useCompoundMarkets() {
  const { rari } = useRari();

  // holds all cToken markets
  const [markets, setMarkets] = useState<MarketInfo[]>([]);

  // ref for refresh interval
  const refreshInterval = useRef<number | null>(null);

  useEffect(() => {
    async function getMarkets() {
      // get all markets from Comptroller

      // asynchronously fetch list of underlying tokens and supply/borrow rates
      const marketData: CTokenData[] = [];
      await Promise.all(
        CTOKEN_LIST.map(async (cTokenAddress) => {
          const cToken = new rari.web3.eth.Contract(CErc20.abi, cTokenAddress);

          const symbol: string = await cToken.methods.symbol().call();
          const supplyRate: number = await cToken.methods
            .supplyRatePerBlock()
            .call();
          const borrowRate: number = await cToken.methods
            .borrowRatePerBlock()
            .call();
          // for cETH, return dummy ETH "address" (0x000000...)
          // otherwise, use address from underlying()
          const underlyingAddress: string =
            symbol === "cETH"
              ? ETH_TOKEN_DATA.address
              : ((await cToken.methods.underlying().call()) as string);

          // add underlying token address & lend/borrow rates to list
          marketData.push({
            cTokenAddress, // address of original cToken
            marketInfo: {
              tokenAddress: underlyingAddress,
              rates: {
                lending: convertRatePerBlockToAPY(supplyRate),
                borrowing: convertRatePerBlockToAPY(borrowRate),
              },
            },
          });
        })
      );

      // sort market data according to cToken list
      marketData.sort(
        (a, b) =>
          CTOKEN_LIST.indexOf(a.cTokenAddress) -
          CTOKEN_LIST.indexOf(b.cTokenAddress)
      );

      // set markets in state
      setMarkets(marketData.map((data) => data.marketInfo));
    }

    getMarkets().then(() => {
      refreshInterval.current = window.setInterval(getMarkets, 5000);
    });

    // clear refreshInterval on unmount (if initialized)
    return () => {
      window.clearInterval(refreshInterval.current || -1);
    };
  }, [rari.web3]);

  return markets;
}

// rate expressed in mantissa
function convertRatePerBlockToAPY(rate: number) {
  // Compound uses 6570 blocks per day:
  // (see https://compound.finance/docs#protocol-math)
  return (1 + (rate * 6570) / 1e18) ** 365 - 1;
}

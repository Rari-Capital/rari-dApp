import { ChainID } from "./networks";

interface TokenDataOverride {
  symbol?: string;
  name?: string;
  logoURL?: string;
  color?: string;
}

export const TokenDataOverrides: {
  [chainId: number]: {
    [tokenId: string]: TokenDataOverride;
  };
} = {
  [ChainID.MAINNET]: {
    // FTX
    "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9": {
      symbol: "FTT",
      name: "FTX Token",
    },
    // OT-aUSDC
    "0x8fcb1783bf4b71a51f702af0c266729c4592204a": {
      // OT token names are too long.
      symbol: "OT-aUSDC22",
      name: "OT-aUSDC DEC22-20",
    },
    // OT-cDAI22
    "0x3d4e7f52efafb9e0c70179b688fc3965a75bcfea": {
      // OT token names are too long.
      symbol: "OT-cDAI22",
      name: "OT-cDAI DEC22-20",
    },
    // xSDT
    "0xaC14864ce5A98aF3248Ffbf549441b04421247D3": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/xSDT.png",
    },
    // sd3Crv
    "0xB17640796e4c27a39AF51887aff3F8DC0daF9567": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sd3Crv.png",
    },
    // sdeursCRV
    "0xCD6997334867728ba14d7922f72c893fcee70e84": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sdeursCRV.png",
    },
    // linkCRV
    "0xFD4D8a17df4C27c1dD245d153ccf4499e806C87D": {
      name: "linkCRV Gauge Deposit",
      symbol: "[G]linkCRV",
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/crvLINKGauge.png",
    },
    // wstETH
    "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0": {
      name: "Wrapped Staked Ether",
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/wstETH.png",
    },
    // sOHM
    "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sOHM.png",
    },
    //   SKIP G-UNI
    // VCRED
    "0xe7b982f901b47d6fa21f5d1f3ad4b64c105060bf": {
      logoURL:
        "https://raw.githubusercontent.com/spacechain/vcred-token/main/bee-256-256.png",
    },

    // Handlefi
    // fxAUD
    "0x7E141940932E3D13bfa54B224cb4a16510519308": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxAUDDarkLogo.png",
    },
    // fxEUD
    "0x116172b2482c5dc3e6f445c16ac13367ac3fcd35": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxEURDarkLogo.png",
    },

    // fxPHP
    "0x3d147cd9ac957b2a5f968de9d1c6b9d0872286a0": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxPHPDarkLogo.png",
    },

    // Tokemak
    // tTOKE
    "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tTOKE.png",
    },
    // tUSDC
    "0x04bDA0CF6Ad025948Af830E75228ED420b0e860d": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tUSDC.png",
    },
    // tWETH
    "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tWETH.png",
    },
    "0x1b429e75369ea5cd84421c1cc182cee5f3192fd3": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/UniV2.png",
    },
    "0x8858A739eA1dd3D80FE577EF4e0D03E88561FaA3": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tSUSHI.png",
    },
    // txJP
    "0x961dd84059505d59f82ce4fb87d3c09bec65301d": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/TXJP.png",
    },
  },
  [ChainID.ARBITRUM]: {
    "0x0e15258734300290a651FdBAe8dEb039a8E7a2FA": {
      //   logoURL:
      //     "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/TXJP.png",
    },
  },
  [ChainID.KOVAN]: {
    // RAI
    "0x76b06a2f6df6f0514e7bec52a9afb3f603b477cd": {
      logoURL:
        "https://raw.githubusercontent.com/sushiswap/icons/master/token/rai.jpg",
    },
    // WETH
    "0xd0a1e359811322d97991e03f863a0c30c2cf029c": {
      logoURL:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd0A1E359811322d97991E03f863a0C30C2cF029C/logo.png",
    },
  },
};

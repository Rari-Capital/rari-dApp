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

    //Fei3rcv
    "0x06cb22615BA53E60D67Bf6C341a0fD5E718E1655": {
      logoURL:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
      symbol: "FEI3CRV",
    },
    //D3-f
    "0xbaaa1f5dba42c3389bdbc2c9d2de134f5cd0dc89": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/d3.jpg",
      symbol: "D3",
    },
    //D3-f
    "0xBaaa1F5DbA42C3389bDbc2c9D2dE134F5cD0Dc89": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/d3.jpg",
      symbol: "D3",
    },
    //D3-f
    "0x3D1556e84783672f2a3bd187a592520291442539": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/G-UNI.png",
    },
    // G-UNI
    "0xCf84a3dC12319531E3deBD48C86E68eAeAfF224a": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/G-UNI.png",
    },
    // UST
    "0xa693b19d2931d498c5b318df961919bb4aee87a5": {
      name: "TerraUSD",
      symbol: "UST (Wormhhole)",
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/UST.jpeg",
    },
    // FODL
    "0x7e05540A61b531793742fde0514e6c136b5fbAfE": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/l2tokendata/src/static/tokens/FODL.png",
    },
  },
  [ChainID.ARBITRUM]: {
    "0x17fc002b466eec40dae837fc4be5c67993ddbd6f": {
      logoURL:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x853d955aCEf822Db058eb8505911ED77F175b99e/logo.png",
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

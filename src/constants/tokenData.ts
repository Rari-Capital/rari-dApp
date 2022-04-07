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
    "0x961dD84059505D59f82cE4fb87D3c09bec65301d": {
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
    // Wormhole UST
    "0xa693B19d2931d498c5B318dF961919BB4aee87a5": {
      name: "Wormhole UST",
      symbol: "USTw",
      logoURL:
        "https://raw.githubusercontent.com/sushiswap/icons/master/token/ust.jpg",
    },
    // Terra UST
    "0xa47c8bf37f92abed4a126bda807a7b7498661acd": {
      name: "Terra UST",
      symbol: "UST",
      logoURL: "https://miro.medium.com/max/1000/1*NQsDZz1XgwOik3PpejCALQ.png",
    },
    // FODL
    "0x7e05540A61b531793742fde0514e6c136b5fbAfE": {
      logoURL:
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/l2tokendata/src/static/tokens/FODL.png",
    },
    // stkAAVE
    "0x4da27a545c0c5B758a6BA100e3a049001de870f5": {
      logoURL:
        "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png",
    },
    // ICHI oneBTC
    "0xEc4325F0518584F0774b483c215F65474EAbD27F": {
      logoURL: "https://cdn.discordapp.com/attachments/953712381886861372/957671684515696660/logo.png",
      symbol: "oneBTC"
    },
    // ICHI oneUNI
    "0x8290D7a64F25e6b5002d98367E8367c1b532b534": {
      logoURL: "https://cdn.discordapp.com/attachments/953712381886861372/957671604060553257/logo.png",
      symbol: "oneUNI"
    },
    // ICHI oneUNI
    "0xfaeCcee632912c42a7c88c3544885A8D455408FA": {
      logoURL: "https://cdn.discordapp.com/attachments/953712381886861372/956944983515086959/ICHI_Uni.png",
      symbol: "oneUNI_LP"
    },
    // ICHI oneBTC Angel Vault LP
    "0x5318c21c96256ce4b73c27D405147df97d28E0Be": {
      logoURL: "https://cdn.discordapp.com/attachments/953712381886861372/956945051240513596/ICHI_BTC.png",
      symbol: "oneBTC_LP"
    },
    // FOX
    "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d": {
      symbol: "FOX"
    },
    // oneFOX
    "0x03352D267951E96c6F7235037C5DFD2AB1466232": {
      symbol: "oneFOX"
    },
    // oneFOX ICHI Angel Vault LP
    "0x779F9BAd1f4B1Ef5198AD9361DBf3791F9e0D596": {
      name: "oneFOX Angel Vault LP",
      logoURL: "https://cdn.discordapp.com/attachments/954083960454000711/960193552732782652/OneFOX_Angel_Vault_LP.png",
      symbol: "oneFOX ICHI LP"
    },
    // UNI-v2 WETH-Fox LP
    "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c": {
      logoURL: "https://cdn.discordapp.com/attachments/954083960454000711/960196275008073818/FOX-WETH_UniswapV2_LP.png",
      name: "FOX-ETH UniV2 LP",
      symbol: "FOX-ETH UniV2 LP",
    }
  },
  [ChainID.ARBITRUM]: {
    "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F": {
      logoURL:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x853d955aCEf822Db058eb8505911ED77F175b99e/logo.png",
    },
    "0x4A717522566C7A09FD2774cceDC5A8c43C5F9FD2": {
      logoURL:
        "https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/ethereum/assets/0x956F47F50A910163D8BF957Cf5846D573E7f87CA/logo.png",
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

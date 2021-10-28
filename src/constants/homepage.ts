// Logos
import { FusePoolMetric } from "utils/fetchFusePoolData";
import { Pool } from "utils/poolUtils";

/* Fuse Pools Marquee */
export interface HomepageFusePool {
  id: number;
  title?: string | null;
  subtitle?: string | null;
}

export const HOMEPAGE_FUSE_POOLS: HomepageFusePool[] = [
  {
    id: 18,
    // title: "Pool 1",
    // subtitle: "Pool 1",
  },
  {
    id: 8,
    // title: "Pool 2",
    // subtitle: "Pool 2",
  },

  {
    id: 6,
    // title: "Pool 4",
    // subtitle: "Pool 4",
  },
  {
    id: 7,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 9,
    // title: "Pool 1",
    // subtitle: "Pool 1",
  },
  {
    id: 3,
    // title: "Pool 2",
    // subtitle: "Pool 2",
  },

  {
    id: 24,
    // title: "Pool 4",
    // subtitle: "Pool 4",
  },
  {
    id: 25,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 23,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 11,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 5,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 14,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 13,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
  {
    id: 19,
    // title: "Pool 5",
    // subtitle: "Pool 5",
  },
];

/* Opportunities */
export enum HomepageOpportunityType {
  EarnVault,
  FusePool,
  EarnPage,
  FusePage,
  Pool2Page,
  TranchesPage,
}

export interface HomepageOpportunity {
  type: HomepageOpportunityType;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  // Conditional params
  vaultType?: Pool;
  fusePoolId?: number;
  fuseMetric?: FusePoolMetric;
}

export const HOMEPAGE_OPPORTUNIES: HomepageOpportunity[] = [
  {
    type: HomepageOpportunityType.EarnPage,
    title: "Earn Vaults",
    subtitle: "Sustainable yield made easy",
    bgColor: "#6041FC",
    icon: "/static/icons/earn-glow.svg",
  },
  {
    type: HomepageOpportunityType.FusePage,
    title: "Fuse",
    subtitle: "The first open interest rate market protocol",
    bgColor: "#E6303A",
    icon: "/static/icons/fuse-glow.svg",
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "DAI Vault",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#FFA700",
    icon: "/static/icons/dai-glow.svg",
    vaultType: Pool.DAI,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "USDC Vault",
    subtitle: "Earn interest on USDC deposits",
    bgColor: "#2474cc",
    icon: "/static/icons/usdc-glow.svg",
    vaultType: Pool.USDC,
  },

  {
    type: HomepageOpportunityType.FusePool,
    title: "Tetranode's Pool",
    subtitle: "Lend RGT and borrow against it",
    bgColor: "#00BB28",
    icon: "/static/icons/tetranode-pool.svg",
    fusePoolId: 6,
    fuseMetric: FusePoolMetric.TotalSuppliedUSD,
  },
  {
    type: HomepageOpportunityType.FusePool,
    title: "Olympus Pool Party",
    subtitle: "Lend and borrow off sOHM",
    bgColor: "#00BEFF",
    icon: "/static/icons/olympus-pool.svg",
    fusePoolId: 18,
    fuseMetric: FusePoolMetric.TotalSuppliedUSD,
  },
  {
    type: HomepageOpportunityType.Pool2Page,
    title: "Pool2",
    subtitle: "Rewards for Rari Capital LPs",
    bgColor: "#00BBA8",
    icon: "/static/icons/pool2-glow.svg",
  },
  {
    type: HomepageOpportunityType.TranchesPage,
    title: "Tranches",
    subtitle: "Tranche yields across Earn Pools",
    bgColor: "#F45C30",
    icon: "/static/icons/tranches-glow.svg",
  },
];

export const HOMEPAGE_EARN_VAULTS: HomepageOpportunity[] = [
  {
    type: HomepageOpportunityType.EarnVault,
    title: "USDC Pool",
    subtitle: "Earn interest on USDC deposits",
    bgColor: "#1079FD",
    icon: "/static/icons/usdc-glow.svg",
    vaultType: Pool.USDC,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "ETH Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#A5A7ED",
    icon: "/static/icons/eth-glow.svg",
    vaultType: Pool.ETH,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "DAI Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#FFA700",
    icon: "/static/icons/dai-glow.svg",
    vaultType: Pool.DAI,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "Yield Pool",
    subtitle: "Earn interest on YIELD deposits",
    bgColor: "#101111",
    icon: "static/fuseicon.png",
    vaultType: Pool.YIELD,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "USDC Pool",
    subtitle: "Earn interest on USDC deposits",
    bgColor: "#1079FD",
    icon: "/static/icons/usdc-glow.svg",
    vaultType: Pool.USDC,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "ETH Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#A5A7ED",
    icon: "/static/icons/eth-glow.svg",
    vaultType: Pool.ETH,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "DAI Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#FFA700",
    icon: "/static/icons/dai-glow.svg",
    vaultType: Pool.DAI,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "Yield Pool",
    subtitle: "Earn interest on Yield deposits",
    bgColor: "#101111",
    icon: "static/fuseicon.png",
    vaultType: Pool.YIELD,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "USDC Pool",
    subtitle: "Earn interest on USDC deposits",
    bgColor: "#1079FD",
    icon: "/static/icons/usdc-glow.svg",
    vaultType: Pool.USDC,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "ETH Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#A5A7ED",
    icon: "/static/icons/eth-glow.svg",
    vaultType: Pool.ETH,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "DAI Pool",
    subtitle: "Earn interest on DAI deposits",
    bgColor: "#FFA700",
    icon: "/static/icons/dai-glow.svg",
    vaultType: Pool.DAI,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "Yield Pool",
    subtitle: "Earn interest on Yield deposits",
    bgColor: "#101111",
    icon: "static/fuseicon.png",
    vaultType: Pool.YIELD,
  },
];

// Logos
import FuseLogo from "static/fuseicon.png";
import { FusePoolMetric } from "utils/fetchFusePoolData";
import { Pool } from "utils/poolUtils";

/* Fuse Pools Marquee */
export interface HomepageFusePool {
  id: number;
  title?: string;
  subtitle: string;
}

export const HOMEPAGE_FUSE_POOLS: HomepageFusePool[] = [
  {
    id: 1,
    subtitle: "Pool 1",
  },
  {
    id: 2,
    subtitle: "Pool 2",
  },
  {
    id: 3,
    subtitle: "Pool 3",
  },
  {
    id: 4,
    subtitle: "Pool 4",
  },
  {
    id: 5,
    subtitle: "Pool 5",
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
  text: string;
  icon: string;
  bgColor: string;
  // Optional params
  vaultType?: Pool;
  fusePoolId?: number;
  fuseMetric?: FusePoolMetric;
}

export const HOMEPAGE_OPPORTUNIES: HomepageOpportunity[] = [
  {
    type: HomepageOpportunityType.EarnVault,
    title: "ETH Pool",
    text: "Earn interest on ETH deposits",
    bgColor: "#A5A7ED",
    icon: FuseLogo,
    vaultType: Pool.ETH,
  },
  {
    type: HomepageOpportunityType.EarnVault,
    title: "DAI Pool",
    text: "Earn interest on DAI deposits",
    bgColor: "#FFA700",
    icon: FuseLogo,
    vaultType: Pool.STABLE,
  },
  {
    type: HomepageOpportunityType.FusePool,
    title: "Tetranode's Pool",
    text: "Lend RGT and borrow against it",
    bgColor: "#00BB28",
    icon: FuseLogo,
    fusePoolId: 6,
    fuseMetric: FusePoolMetric.TotalSuppliedUSD,
  },
  {
    type: HomepageOpportunityType.FusePool,
    title: "Rari DAO Fuse Pool",
    text: "Lend and borrow top community assets",
    bgColor: "#00BEFF",
    icon: FuseLogo,
    fusePoolId: 3,
    fuseMetric: FusePoolMetric.TotalSuppliedUSD,
  },
];


import { gql } from "graphql-tag";

export const GET_TOP_PERFORMING_FUSE_STABLE = gql`
  {
    markets(
      where: { underlyingSymbol_in: ["USDC", "DAI"] }
      orderBy: supplyRate
      orderDirection: desc
      first: 1
    ) {
      id
      supplyRate
      supplyRateAPR
      supplyRateAPY
      symbol
      totalBorrows
      totalSupply
      name
      borrowIndex
    }
  }
`;

import gql from "graphql-tag";

export const GET_ALL_UNDERLYING_ASSETS = gql`
  query GetAllUnderlyingAssets {
    underlyingAssets {
      symbol
      price
      name
      id
    }
  }
`;

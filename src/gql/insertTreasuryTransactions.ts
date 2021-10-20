import { gql } from "graphql-tag";

//this query is meant only for hasura endpoint located at https://rari-test.hasura.app/v1/graphql
export const INSERT_TREASURY_TRANSACTIONS_MUTATION = gql`
  mutation InsertTxs($objects: [treasury_transactions_insert_input!]!) {
    insert_treasury_transactions(objects: $objects, on_conflict: {constraint: treasury_transactions_pkey, update_columns: id}) {
      returning {
        id
        block_number
        to
        from
        value
      }
    }
  }
`;



export const GET_TREASURY_TRANSACTIONS = gql`
  query GetTreasuryTransactions {
    treasury_transactions(order_by: {block_number: desc}) {
      block_number
      id
      to
      from
      value
    }
  }
`;

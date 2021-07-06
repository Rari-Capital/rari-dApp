export type InterestRatesType = {
  lending: number;
  borrowing: number;
};

export type MarketInfo = {
  tokenAddress: string;
  rates: InterestRatesType;
};

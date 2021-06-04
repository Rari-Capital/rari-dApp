import { GetStaticProps, NextPage } from "next";

// Components
import TokenDetails from "components/pages/Tokens/TokenDetails";

// Constants
import TOKENS from "static/compiled/tokens.json";
import { ETH_TOKEN_DATA, TokenData } from "hooks/useTokenData";

const TokenDetailsPage: NextPage<{ token: TokenData }> = ({ token }) => {
  return <TokenDetails token={token} />;
};

export default TokenDetailsPage;

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tokenSymbol: string = (params?.tokenId as string).toUpperCase();

  // @ts-ignore
  let token: TokenData | null = TOKENS[tokenSymbol] ?? null;
  if (tokenSymbol === "ETH") {
    token = ETH_TOKEN_DATA;
  }

  return {
    props: {
      token,
    },
  };
};

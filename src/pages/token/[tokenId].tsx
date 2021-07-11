import { GetStaticProps, NextPage } from "next";

// Components
import TokenDetails from "components/pages/Tokens/TokenDetails";

// Constants
import TOKENS from "static/compiled/tokens.json";
import { ETH_TOKEN_DATA, fetchTokenData, TokenData } from "hooks/useTokenData";

// Utils
import Web3 from "web3";
const web3 = new Web3();

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
  let tokenAddress: string = "";

  // Most of the time this is an address, sometimes it could be a symbol.
  const tokenId: string = (params?.tokenId as string).toUpperCase();

  // let token: TokenData | null = TOKENS[tokenSymbol] ?? null;

  try {
    // Try to checksum this address
    tokenAddress = web3.utils.toChecksumAddress(params?.tokenId as string);
  } catch (err) {
    // try to find a symbol for this in our constants file
    if (tokenId === "ETH") {
      tokenAddress = ETH_TOKEN_DATA.address;
    }
  } finally {
    if (!tokenAddress) {
      return {
        notFound: true,
      };
    }
  }

  // Fetch the tokenData. Throw 404 if error.
  try {
    const token: TokenData = await fetchTokenData(tokenAddress);
    if (!token) throw new Error(`Error fetching token ${tokenAddress}.`);
    return {
      props: {
        token,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

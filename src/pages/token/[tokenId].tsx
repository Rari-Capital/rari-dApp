import { GetStaticProps, NextPage } from "next";

// Components
import TokenDetails from "components/pages/Tokens/TokenDetails";

// Constants
import { ETH_TOKEN_DATA, fetchTokenData, TokenData } from "hooks/useTokenData";

// Util
import Web3 from "web3";
import useSWR from "swr";
import { useRouter } from "next/router";
import { Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useState } from "react";
import { Column } from "utils/chakraUtils";
const web3 = new Web3();

const tokenDataFetcher = async (
  tokenAddress: string
): Promise<TokenData | undefined> => {
  if (!tokenAddress) return undefined;
  console.log({ tokenAddress });
  const token: TokenData = await fetchTokenData(tokenAddress);
  return token;
};

const TokenDetailsPage: NextPage<{ token: TokenData }> = () => {
  const router = useRouter();
  const [tokenAddress, setTokenAddress] = useState<string>("");

  useEffect(() => {
    const tokenId = (router.query.tokenId as string)?.toUpperCase();

    try {
      const tokenAddress =
        tokenId === "ETH"
          ? ETH_TOKEN_DATA.address
          : web3.utils.toChecksumAddress(tokenId);
      setTokenAddress(tokenAddress);
    } catch (err) {
      console.error(err);
      router.push("/404");
    }
  }, []);

  const { data, error } = useSWR(tokenAddress, tokenDataFetcher);

  console.log({ data, error });

  if (!data)
    return (
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        w="100%"
        h="100%"
      >
        <Spinner />;
      </Column>
    );

  return <TokenDetails token={data} />;
};

export default TokenDetailsPage;

// export const getStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   let tokenAddress: string = "";

//   // Most of the time this is an address, sometimes it could be a symbol.
//   const tokenId: string = (params?.tokenId as string).toUpperCase();

//   // let token: TokenData | null = TOKENS[tokenSymbol] ?? null;

//   try {
//     // Try to checksum this address
//     tokenAddress = web3.utils.toChecksumAddress(params?.tokenId as string);
//   } catch (err) {
//     // try to find a symbol for this in our constants file
//     if (tokenId === "ETH") {
//       tokenAddress = ETH_TOKEN_DATA.address;
//     }
//   } finally {
//     if (!tokenAddress) {
//       return {
//         notFound: true,
//       };
//     }
//   }

//   // Fetch the tokenData. Throw 404 if error.
//   try {
//     const token: TokenData = await fetchTokenData(tokenAddress);
//     if (!token) throw new Error(`Error fetching token ${tokenAddress}.`);
//     return {
//       props: {
//         token,
//       },
//     };
//   } catch (err) {
//     return {
//       notFound: true,
//     };
//   }
// };

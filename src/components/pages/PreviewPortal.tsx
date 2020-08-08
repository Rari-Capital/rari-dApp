import React, { useState } from "react";
import {
  Image,
  Flex,
  Box,
  Stack,
  Text,
  Heading,
  Spinner,
} from "@chakra-ui/core";
import { useWeb3 } from "../../context/Web3Context";
import WideLogo from "../../assets/wide-logo.png";

const PreviewPortal = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useWeb3();

  const onRequestConnect = () => {
    setLoading(true);
    login()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  return (
    <Flex
      width="100%"
      flexDirection="column"
      alignItems="flex-start"
      p={6}
      color="#FFFFFF"
    >
      <Image src={WideLogo} mb={2} />
      <Flex
        width="100%"
        height={{ md: "500px", xs: "auto" }}
        flexDirection={{ md: "row", xs: "column" }}
      >
        <Box
          width={{ md: "20%", xs: "100%" }}
          height="100%"
          backgroundColor="#121212"
          borderRadius="10px"
          border="1px"
          borderColor="#272727"
        >
          <Stack
            width="100%"
            height="100%"
            justifyContent="space-around"
            alignItems="center"
            p={4}
          >
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Heading textAlign="center">14.2%</Heading>
              <Text
                textTransform="uppercase"
                textAlign="center"
                letterSpacing="wide"
                fontSize="xs"
              >
                Today's APR
              </Text>
            </Stack>
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Heading textAlign="center">13.3%</Heading>
              <Text
                textTransform="uppercase"
                textAlign="center"
                letterSpacing="wide"
                fontSize="xs"
              >
                Yearly APR
              </Text>
            </Stack>
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Heading textAlign="center">$10.2m</Heading>
              <Text
                textTransform="uppercase"
                textAlign="center"
                letterSpacing="wide"
                fontSize="xs"
              >
                Assets under management
              </Text>
            </Stack>
          </Stack>
        </Box>
        <Flex
          ml={{ md: 4, xs: 0 }}
          mt={{ md: 0, xs: 4 }}
          mb={{ md: 0, xs: 4 }}
          flexDirection="column"
          width={{ md: "80%", xs: "100%" }}
        >
          <Box
            height={{ md: "90%", xs: "400px" }}
            backgroundColor="#121212"
            borderRadius="10px"
            border="1px"
            borderColor="#272727"
          >
            <Flex alignItems="center" justifyContent="center" height="100%">
              <Heading fontSize="6xl">📈</Heading>
            </Flex>
          </Box>

          <Flex mt={4} height="10%">
            <Box
              as="button"
              onClick={onRequestConnect}
              width="50%"
              height={{ md: "100%", xs: "40px" }}
              backgroundColor="#121212"
              borderRadius="10px"
              border="1px"
              borderColor="#272727"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              {loading ? (
                <Spinner />
              ) : (
                <Text textAlign="center" fontWeight="bold" fontSize="lg">
                  Connect Wallet
                </Text>
              )}
            </Box>

            <Box
              as="button"
              onClick={() =>
                window.open(
                  "https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1"
                )
              }
              width="50%"
              height={{ md: "100%", xs: "40px" }}
              ml={4}
              backgroundColor="#121212"
              borderRadius="10px"
              border="1px"
              borderColor="#272727"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Get Wallet
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Text textAlign="center" width="100%" my={8}>
        © {new Date().getFullYear()} Rari Capital. All rights reserved.
      </Text>
    </Flex>
  );
};

export default PreviewPortal;

import React from "react";
import { Image, Flex, Box, Stack, Text, Heading } from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

const UserPortal = () => {
  const { address } = useAuthedWeb3();

  return (
    <Flex width="100%" flexDirection="column" alignItems="flex-start" p={6}>
      <Image src="https://i.imgur.com/wDgikRS.png" mb={2} />
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
              <Heading color="#FFFF" textAlign="center">
                14.2%
              </Heading>
              <Text
                textTransform="uppercase"
                color="#FFFFFF"
                textAlign="center"
                letterSpacing="wide"
                fontSize="xs"
              >
                Today's APR
              </Text>
            </Stack>
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Heading color="#FFFF" textAlign="center">
                13.3%
              </Heading>
              <Text
                textTransform="uppercase"
                color="#FFFFFF"
                textAlign="center"
                letterSpacing="wide"
                fontSize="xs"
              >
                Yearly APR
              </Text>
            </Stack>
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Heading color="#FFFF" textAlign="center">
                $10.2m
              </Heading>
              <Text
                textTransform="uppercase"
                color="#FFFFFF"
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
              <Heading color="#FFFFFF" fontSize="xl">
                Hello {address}!
              </Heading>
            </Flex>
          </Box>

          <Flex mt={4} height="10%">
            <Box
              as="button"
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
              <Text
                textAlign="center"
                color="#FFF"
                fontWeight="bold"
                fontSize="lg"
              >
                Connect Wallet
              </Text>
            </Box>

            <Box
              as="button"
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
              <Text
                color="#FFFFFF"
                fontWeight="bold"
                fontSize="lg"
                textAlign="center"
              >
                Get Wallet
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Text textAlign="center" width="100%" my={8} color="#FFFFFF">
        © {new Date().getFullYear()} Rari Capital. All rights reserved.
      </Text>
    </Flex>
  );
};

export default UserPortal;

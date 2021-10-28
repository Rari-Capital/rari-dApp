import { useMemo } from "react";
import { Box, Heading, Text, Image, Skeleton } from "@chakra-ui/react";
import { Column, Row } from "lib/chakraUtils";

import {
  HomepageOpportunity,
  HomepageOpportunityType,
} from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";
import AppLink from "components/shared/AppLink";

const OpportunityCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {
  const subheading: string | null = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <AppLink href={link} style={{ textDecoration: "none" }}>
      <Box
        bg={opportunity.bgColor}
        height={{
          sm: "140px",
          md: "140px",
          lg: "160px",
          xl: "140px",
          "2xl": "170px",
        }}
        width="100%"
        borderRadius="lg"
        p="5%"
        transition="transform 0.2s ease 0s"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: ".2px .3px 1px white;",
        }}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          h="100%"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height={"100%"}
            flex="0 0 70%"
          >
            <Heading
              fontSize={{
                sm: "md",
                md: "md",
                lg: "md",
                xl: "md",
                "2xl": "xl",
              }}
            >
              {opportunity.title}
            </Heading>
            <Skeleton isLoaded={!!subheading} height="10px" my={1}>
              <Text
                fontSize={{
                  sm: "sm",
                  md: "sm",
                  lg: "sm",
                  xl: "sm",
                  "2xl": "md",
                }}
                fontWeight="bold"
              >{`${subheading}`}</Text>
            </Skeleton>

            <Text
              fontSize={{
                sm: "sm",
                md: "sm",
                lg: "sm",
                xl: "sm",
                "2xl": "md",
              }}
              mt={4}
            >
              {opportunity.subtitle}
            </Text>
          </Column>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height={"100%"}
            flex="0 1 30%"
          >
            <Image
              src={opportunity.icon}
              boxSize={{
                sm: "60px",
                md: "60px",
                lg: "60px",
                xl: "60px",
                "2xl": "80px",
              }}
              my="auto"
              mx="auto"
            />
          </Column>
        </Row>
        {/* <Image
          src={
            opportunity.type === HomepageOpportunityType.FusePool
              ? "/static/icons/fuse-glow.svg"
              : opportunity.type === HomepageOpportunityType.EarnVault
              ? "/static/icons/earn-glow.svg"
              : undefined
          }
          boxSize={"20px"}
          position="absolute"
          bottom={0}
          right={0}
          mx={2}
          my={2}
        /> */}
      </Box>
    </AppLink>
  );
};

export default OpportunityCard;

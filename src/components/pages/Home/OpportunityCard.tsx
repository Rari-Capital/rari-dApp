import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Heading, Text, Link, Image, LinkBox } from "@chakra-ui/react";
import { Column, Row } from "buttered-chakra";

import { HomepageOpportunity } from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";

const OpportunityCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {
  const subheading = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <Link to={link} as={RouterLink} style={{ textDecoration: "none" }}>
      <LinkBox
        bg={opportunity.bgColor}
        height="126px"
        width="100%"
        borderRadius="lg"
        p={["5%", "5%", "5%"]}
        transition="transform 0.2s ease 0s"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: ".5px 1px 4px white;"

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
            <Heading size="xs">{opportunity.title}</Heading>
            <Text fontSize="xs">{subheading}</Text>
            <Text fontSize="xs" mt={2}>
              {opportunity.subtitle}
            </Text>
          </Column>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height={"100%"}
            flex="0 1 30%"
          >
            <Image src={opportunity.icon} boxSize="50px" my="auto" mx="auto" />
          </Column>
        </Row>
      </LinkBox>
    </Link>
  );
};

export default OpportunityCard;

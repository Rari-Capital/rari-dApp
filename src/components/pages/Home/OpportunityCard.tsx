import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Heading, Text, Link, Image, LinkBox } from "@chakra-ui/react";
import { Column, Row } from "buttered-chakra";

import { HomepageOpportunity } from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";

const OpportunityCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {

  const subtitle = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <Link to={link} as={RouterLink} style={{ textDecoration: "none" }}>
      <LinkBox
        bg={opportunity.bgColor}
        height="100%"
        width="100%"
        borderRadius="lg"
        p={["5%", "10%", "10%"]}
        transition="transform 0.2s ease 0s"
        _hover={{
          transform: "translateY(-5px)",
        }}
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height={"100%"}
          >
            <Heading size="xs">{opportunity.title}</Heading>
            <Text fontSize="xs">{subtitle}</Text>
            <Text fontSize="xs" mt={2}>
              {opportunity.text}
            </Text>
          </Column>
          <Image src={opportunity.icon} boxSize="50px" float="left" my="auto" />
        </Row>
      </LinkBox>
    </Link>
  );
};

export default OpportunityCard;

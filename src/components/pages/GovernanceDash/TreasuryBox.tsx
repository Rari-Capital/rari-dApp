import DashboardBox from "components/shared/DashboardBox";
import { Row, Column } from "lib/chakraUtils";
import { Text, Heading }  from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";
import { getTeasuryTransactions } from "hooks/governance/queries";
import { useRari } from "context/RariContext";





const TreasuryBox = () => {


  const { rari } = useRari();

  getTeasuryTransactions(rari)

  return (

    <DashboardBox width="400px" height="450px" background="000000" paddingTop="10px">
      <Text fontSize="24px" color="#858585" paddingLeft="15px"> Treasury Outgoing </Text>

        <Row
        paddingLeft="15px"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        paddingBottom="5px"
        width="100%"
        >
          <Column width = "45%">
            <Text color="#858585" fontSize="16px" >
            Summary
            </Text>

          </Column>
          <Column width = "30%">
            <Text color="#858585" fontSize="16px" >
            Amount
            </Text>
          </Column>
          <Column width = "15%">
            <Text color="#858585" fontSize="16px" >
            Date
            </Text>
          </Column>
        </Row>

      <ModalDivider/>




    </DashboardBox>

  )
}



export default TreasuryBox

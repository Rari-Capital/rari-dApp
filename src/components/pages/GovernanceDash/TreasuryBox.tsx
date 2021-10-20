import DashboardBox from "components/shared/DashboardBox";
import { Row, Column } from "lib/chakraUtils";
import { Text, Heading, Spinner }  from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";
import axios from 'axios'
import { useEffect, useState } from "react";
import TreasuryTransaction from "./TreasuryTransaction"
import { FUSE_POOLS } from "utils/relevantTreasuryInteractions"
import { useRari } from "context/RariContext";
import { timestampToDate } from "utils/timestampUtilities"

import { useIsSemiSmallScreen } from "hooks/useIsSemiSmallScreen"
import { useIsVerySmall } from "hooks/useIsVerySmall";

import FullPageSpinner from "components/shared/FullPageSpinner";


const TreasuryBox = () => {
  const [transactions, setTransactions] = useState()
  const { rari } = useRari()
  const isMobile = useIsSemiSmallScreen()
  const isVerySmall = useIsVerySmall()

  useEffect(() => {
    getAllTransactions()

    return () => {
      setTransactions([])
    }

  },[])



const getAllTransactions = async () => {

  const response = await axios.get("/api/treasury")
  const tsxs = response.data.treasury_transactions
  const filteredTransactions = tsxs.filter(t => ((t.to != "") && (t.to != "0x10db6bce3f2ae1589ec91a872213dae59697967a")) && (t.value > 0))

  const labledTransactions = filteredTransactions.map(t => {
    const filtered = FUSE_POOLS.filter(x => x.address == t.to)
    if (filtered.length > 0){
      t.toLabel = filtered[0].label
    }
    return t
  })
  setTransactions(labledTransactions)

}

  return (

    <Column width="100%">
      <DashboardBox width="100%" height={isMobile ? "650px" : "450px" }  background="000000" paddingTop="10px" borderColor ="#4D4D4D">
          <Column width="100%" height="70px">
            <Text fontSize="24px" color="#858585" paddingLeft="15px"> Treasury Outgoing </Text>
            <Row
            paddingLeft="15px"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            >
              <Column width = "45%">
                <Text color="#858585" fontSize={isVerySmall ? "13px" :"16px"} >
                Summary
                </Text>

              </Column>
              <Column width = "20%" paddingLeft={isVerySmall ? "8px" : "15px"}>
                <Text color="#858585" fontSize={isVerySmall ? "13px" :"16px"} >
                Amount
                </Text>
              </Column>
              <Column paddingLeft="18px">
                <Text color="#858585" fontSize={isVerySmall ? "13px" :"16px"} >
                Date
                </Text>
              </Column>
            </Row>
          </Column>
        <ModalDivider/>
        {
          !transactions ?
            <Column height={isMobile ? "562px" : "362px"} width="100%" mainAxisAlignment="center" crossAxisAlignment="center">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="#121212"
                size="xl"
              />
            </Column>

          :
          <Column height={isMobile ? "562px" : "362px"} with="100%" overflowY="scroll">
          {
            (typeof(transactions) == "undefined") ? <div>LOADING</div> :
            transactions.map(t =>
              <TreasuryTransaction transaction={t} key={t.id}/>
            )
          }
          </Column>

        }

      </DashboardBox>
    </Column>
  )
}



export default TreasuryBox

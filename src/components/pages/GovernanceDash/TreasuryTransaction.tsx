import { Row, Column } from "lib/chakraUtils";
import { Text, Heading }  from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";
import { useEffect, useState } from "react";
import { timestampToDate } from "utils/timestampUtilities"
import { useRari } from "context/RariContext";
import { useIsVerySmall } from "hooks/useIsVerySmall"



import { FUSE_POOLS } from "utils/relevantTreasuryInteractions"



//treasury addr
//https://etherscan.io/address/0x10dB6Bce3F2AE1589ec91A872213DAE59697967a

const TreasuryTransaction = ({transaction}) => {
  const { rari } = useRari()
  const [date, setDate] = useState('')

  const isVerySmall = useIsVerySmall()

  useEffect(() => {
    configDate()

    return () => {
      setDate('')
    }
  },[])

  const configDate =  () => {
    rari.web3.eth.getBlock(transaction.block_number).then(block => {
      const ts = block.timestamp*1000
      setDate(timestampToDate(ts))
    })
  }



  return (
    <Column paddingTop="2px" paddingBottom="2px">

      <Row width="100%" height="30px" crossAxisAlignment="center" paddingLeft="15px">
        <Column width="45%" paddingRight="15px">
          <Text width="100%" fontSize={isVerySmall ? "11px" :"14px"} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {transaction.toLabel ? transaction.toLabel : transaction.to}
          </Text>

        </Column>

        <Column width="20%" paddingLeft={isVerySmall ? "8px" :"18px"}>
          <Text  fontSize={isVerySmall ? "11px" :"14px"}>
          {(transaction.value/1000000000000000000).toFixed(1)} ETH
          </Text>

        </Column>

        <Column paddingLeft="18px" >
          <Text fontSize={isVerySmall ? "11px" :"14px"}>
          {date}
          </Text>

        </Column>

      </Row>
      <ModalDivider />

    </Column>
  )
}

//    {transaction.value/1000000000000000000}


export default TreasuryTransaction

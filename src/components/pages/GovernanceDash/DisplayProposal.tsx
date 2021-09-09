import { Center, Row, Column } from "lib/chakraUtils";
import { Text, Heading, Link }  from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";
import { useRari } from "context/RariContext";
import { useEffect, useState } from "react";

const DisplayProposal = (props) => {
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const proposal = props.proposal
  const { rari } = useRari();

  useEffect(() => {
    setTimestamps()
  },[])
  //var startDate
  //var endDate

  const setTimestamps =  () => {
    rari.web3.eth.getBlock(proposal.startBlock).then(block => {
      const startTimestamp = block.timestamp*1000
      return startTimestamp
    }).then(stamp => {
      //console.log('start stamp: ', stamp)
      setStartDate(new Date(stamp))
      //startDate = new Date(stamp)
      //console.log("sDate: ", startDate.toString())
    })


    rari.web3.eth.getBlock(proposal.endBlock).then(block => {
      const endTimestamp = block.timestamp*1000
      return endTimestamp
    }).then(stamp => {
      //console.log('end stamp: ', stamp)
      setEndDate(new Date(stamp))
      //endDate = new Date(stamp)
      //console.log("edate: ", endDate.toString())
    })
  }








  const voteResult = () => {
    var rtrn

    if ((proposal.forVotes == "0") && (proposal.againstVotes == "0") ){
      rtrn = "No Votes"
    }
    else{
      const forP = (parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))*100).toFixed(0)
      const againstP =  (parseFloat(proposal.againstVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))*100).toFixed(0)
      rtrn = forP.toString() + "% / " + againstP.toString() + "%"
    }

    return rtrn
  }

  return(
    <>
      <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      >
        <Column width="58%">
          <Heading fontSize="17px" paddingLeft="25px" paddingTop="4px" >
            <Link href={"/governance/proposals/" + proposal.id}>
              {"["}{proposal.id}{"] "}{proposal.title}
            </Link>
          </Heading>
          <Text fontSize="17px" paddingLeft="25px" paddingBottom="12px">
          {proposal.description}
          </Text>
        </Column>

        <Column width="27%">
          <Text fontSize="17px" paddingTop="4px" >
            {voteResult()}
          </Text>
        </Column>

        <Column width="15%" paddingTop="4px">
          { typeof(endDate) == "undefined" ? "" : endDate.toUTCString() }
        </Column>
      </Row>
      <ModalDivider />
    </>
  )
}


export default DisplayProposal

import DisplayProposal from './DisplayProposal'
import { useEffect, useState } from "react";
import { Row, Column } from "lib/chakraUtils";
import { Text, Heading }  from "@chakra-ui/react";


const DisplayProposals = ({ setWhichProposals, whichProposals, proposals}) => {


  const displayCorrectProposals = () => {
    if (whichProposals == "Active"){
       return <ActiveProposals proposals={proposals} setWhichProposals={setWhichProposals} />
      }
      else if(whichProposals == "Expired"){
        return <ExpiredProposals proposals={proposals} />
      }
      else {
        return <AllProposals proposals={proposals} />
      }
  }
  //
  return(
    <>
      { displayCorrectProposals() }
    </>
  )
}


const AllProposals = ({proposals}) => {


  return(
    <>
      {(typeof(proposals) == "undefined") ? <div>LOADING</div> :
        proposals.map(p =>
          <DisplayProposal key={p.id} proposal={p}  />
      )}
    </>
  )
}

const ActiveProposals = ({proposals, setWhichProposals}) => {
  const [color, setColor] = useState("#858585")
  const [colorTwo, setColorTwo] = useState("#858585")

  const activeProposals = () => {
    return (typeof(proposals) == "undefined" ? [] : proposals.filter(proposal => proposal.state == "Active"))
  }


  return(
    <>
      {activeProposals().length == 0 ?
        <Row width="100%" height="100%" mainAxisAlignment="center" paddingTop="20px" paddingLeft="20px" paddingRight="20px">
          <Text fontSize = "24px" color="#858585">
            No Active Proposals, Filter by All or Expired
          </Text>
            {/*<Text fontSize = "24px" color="#858585" >
              {"No Active Proposals, Filter For"}
            </Text>
            <Text as="span">
              <Text
              fontSize="24px"
              paddingLeft="10px"
              paddingRight="10px"
              color={color}
              onClick={() => setWhichProposals("All")}
              fontWeight={"semibold"}
              onMouseEnter={() => setColor("#FFFFFF")}
              onMouseLeave={() => setColor("#858585")}
              >
                {"All Proposals"}
              </Text>
              <Text fontSize = "24px" color="#858585" >
                or
              </Text>
              <Text
              fontSize="24px"
              paddingLeft="10px"
              color={colorTwo}
              onClick={() => setWhichProposals("Expired")}
              fontWeight={"semibold"}
              onMouseEnter={() => setColorTwo("#FFFFFF")}
              onMouseLeave={() => setColorTwo("#858585")}
              >
                Expired Proposals
              </Text>
            </Text>*/}
        </Row>

      : activeProposals().map(p =>
        <DisplayProposal key={p.id} proposal={p}  />
      )}
    </>
  )
}

const ExpiredProposals = ({proposals}) => {

  const expiredProposals = () => {
    return (typeof(proposals) == "undefined" ? [] : proposals.filter(proposal =>
      proposal.state == "Expired" || proposal.state == "Executed" || proposal.state == "Canceled" || proposal.state == "Defeated"
      )
    )

  }


  return(
    <>
      {expiredProposals().length == 0 ? "No expired Proposals": expiredProposals().map(p =>
        <DisplayProposal key={p.id} proposal={p}  />
      )}
    </>
  )
}




export default DisplayProposals

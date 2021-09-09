import DisplayProposal from './DisplayProposal'
import { getAllProposals } from "hooks/governance/queries";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import { useRari } from "context/RariContext";

const DisplayProposals = ({ whichProposals}) => {
  //const [proposals, setProposals] = useState([])
  const { rari } = useRari();

  const { data: proposals } = useQuery('null',
    //console.log("in usequery")
    async () => {
      var proposals = await getAllProposals(rari)
      //console.log("allPs: ", proposals)
      return proposals
    }
  )



/*
  useEffect(() => {
    setProposals(useAllProposals)
  },[]) */
  //const queriedProposals = useAllProposals();
  //console.log("whichProposals: ", whichProposals)
  //setAllProposals(queriedProposals)
  //var proposals = allProposals ?? []
  //console.log("proposals: ", proposals)

  const displayCorrectProposals = () => {
    if (whichProposals == "Active"){
       return <ActiveProposals proposals={proposals} />
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
    <div>
      { displayCorrectProposals() }
    </div>
  )
}


const AllProposals = ({proposals}) => {


  return(
    <div>
      {(typeof(proposals) == "undefined") ? <div>LOADING</div> :
        proposals.map(p =>
          <DisplayProposal key={p.id} proposal={p}  />
      )}
    </div>
  )
}

const ActiveProposals = ({proposals}) => {
  //console.log("p0 state: ", proposals[0]?.state)
  //console.log("p1 state: ",  proposals[1]?.state)

  const activeProposals = () => {
    //console.log("proposals: ", proposals)
    /*
    let aProposals = proposals
    aProposals = proposals.filter(proposal => proposal.state == "Active")
    return aProposals */

    return (typeof(proposals) == "undefined" ? [] : proposals.filter(proposal => proposal.state == "Active"))
  }


  return(
    <div>
      {activeProposals().length == 0 ? "No Active Proposals": activeProposals().map(p =>
        <DisplayProposal key={p.id} proposal={p}  />
      )}
    </div>
  )
}

const ExpiredProposals = ({proposals}) => {
  //console.log("p0 state: ", proposals[0]?.state)
  //console.log("p1 state: ",  proposals[1]?.state)

  const expiredProposals = () => {
    let eProposals = proposals
    eProposals = proposals.filter(proposal => proposal.state == "Expired")
    return eProposals
  }


  return(
    <div>
      {expiredProposals().length == 0 ? "No expired Proposals": expiredProposals().map(p =>
        <DisplayProposal key={p.id} proposal={p}  />
      )}
    </div>
  )
}




export default DisplayProposals

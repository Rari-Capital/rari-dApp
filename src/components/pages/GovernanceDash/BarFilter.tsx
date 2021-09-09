import { useEffect, useState } from "react";

import { Row, Column } from "lib/chakraUtils";
import { Heading, Box, Button }  from "@chakra-ui/react";
import DashboardBox from "components/shared/DashboardBox";


const BarFilter = ({setWhichProposals}) => {
  const green = "#41C345"
  const greenHover = "#77d47a"
  const black = "#262626"
  const blackHover = "#4d4d4d"

  const [activeColor, setActiveColor] = useState(green)
  const [activeHover, setActiveHover] = useState(greenHover)

  const [allColor, setAllColor] = useState(black)
  const [allHover, setAllHover] = useState(blackHover)

  const [expiredColor, setExpiredColor] = useState(black)
  const [expiredHover, setExpiredHover] = useState(blackHover)

//can replace box with dashboardbox

  const onActiveClick = () => {

    setWhichProposals("Active")

    setActiveColor(green)
    setActiveHover(greenHover)

    setExpiredColor(black)
    setExpiredHover(blackHover)

    setAllColor(black)
    setAllHover(blackHover)

  }

  const onAllClick = () => {

    setWhichProposals("All")

    setAllColor(green)
    setAllHover(greenHover)

    setActiveColor(black)
    setActiveHover(blackHover)

    setExpiredColor(black)
    setExpiredHover(blackHover)


  }

  const onExpiredClick = () => {

    setWhichProposals("Expired")

    setExpiredColor(green)
    setExpiredHover(greenHover)

    setAllColor(black)
    setAllHover(blackHover)

    setActiveColor(black)
    setActiveHover(blackHover)

  }




  return(

    <Column paddingLeft="25px" paddingBottom="15px">
      <Box
      backgroundColor="#262626"
      border="1px"
      borderColor="#272727"
      width="200px"
      height="30px"
      borderRadius="30px"
      >
        <Row  expand paddingLeft="3px" paddingRight="3px" mainAxisAlignment="center" crossAxisAlignment="center">
          <Button
          width="70px"
          height="90%"
          borderRadius="30px"
          fontSize="14px"
          backgroundColor={activeColor}
          _hover={{ bg: activeHover}}
          onClick={() => onActiveClick()}>
            Active
          </Button>

          <Button
          width="70px"
          height="90%"
          borderRadius="30px"
          fontSize="14px"
          backgroundColor={allColor}
          _hover={{ bg: allHover}}
          onClick={() => onAllClick()}>
              All
          </Button>
          <Button
          width="70px"
          height="90%"
          borderRadius="30px"
          fontSize="14px"
          backgroundColor={expiredColor}
          _hover={{ bg: expiredHover}}
          onClick={() => onExpiredClick()}>
              Expired
          </Button>



        </Row>
      </Box>
    </Column>
  )
}

export default BarFilter

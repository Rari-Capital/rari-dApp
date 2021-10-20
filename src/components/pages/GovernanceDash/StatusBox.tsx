import { Text, Box }  from "@chakra-ui/react";
import { Column } from "lib/chakraUtils";




const StatusBox = ({state, width, height}) => {
  let borderColor = "#FFFFFF";

  const setBorderColor = () => {
    if (state == "Active") {
      borderColor="purple.300"
    }
    if (state == "Pending") {

    }
    if (state == "Queued" || state == "Executed" || state == "Succeeded") {
      borderColor="#41c345"
    }
    if (state == "Canceled" || state == "Defeated" || state == "Expired" ) {
      borderColor="#858585"
    }
  }
  setBorderColor()



  const displayStatus = () => {
    if (state == "Active") {
      return "Active"
    }
    if (state == "Pending") {
      return "Review"
    }
    if (state == "Queued" || state == "Executed" || state == "Succeeded") {
      return "Passed"
    }
    if (state == "Canceled" || state == "Defeated" || state == "Expired" ) {
      return "Failed"
    }

  }

  return(
    <>
      <Box
      width={width}
      height={height}
      borderWidth="1px"
      borderRadius="5px"
      borderColor={borderColor}
      >
        <Column  expand mainAxisAlignment="center" crossAxisAlignment="center">
        <Text fontSize="12px" color={borderColor}>
          {displayStatus()}
        </Text>
        </Column>
      </Box>

    </>
  )
}


export default StatusBox

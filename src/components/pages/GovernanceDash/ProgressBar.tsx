import { Box }  from "@chakra-ui/react";




const ProgressBar = ({ percentageFilled, filledColor }) => {

  return(

    <Box bg="#858585" width="100%" height="9px" borderRadius="3px" >

      <Box
        bg={filledColor}
        width={percentageFilled * 100 + "%"}
        height="9px"
        borderRadius="3px"

      />
      </Box>


    )
}


export default ProgressBar

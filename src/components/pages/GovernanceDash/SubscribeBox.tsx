import { useTranslation } from 'next-i18next';
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useEffect, useState } from "react";

import { Row, Column } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { Heading, Box, Button, Text, Image }  from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage, FormHelperText, Input} from "@chakra-ui/react"
//import { Formik } from "formik"


const SubscribeBox = () => {
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  const [showSubButton, setShowSubButton] = useState(true)




  return(
    <>
      <DashboardBox height={isMobile ? "173px" : "163px"} width={isMobile ? "400px" : "400px"} backgroundColor = "#000000" borderColor ="#4D4D4D">
        <Row
        expand
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        >
          <Column
          expand
          //width="90%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"

          >
            <Row
            height="50%"
            mainAxisAlignment="center"
            crossAxisAlignment="center">
              <Text fontSize="20px" paddingLeft="15px" paddingRight="5px" paddingTop="27px" color="#858585">
                Subscribe to governance notifications
              </Text>
            </Row>
            <Row
            height="50%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center">


            {showSubButton ?
              <Column paddingLeft="15px">
                <Button
                width="140px"
                height="40px"
                fontSize="13px"
                borderRadius="7px"
                paddingLeft="23px"
                onClick={() => setShowSubButton(false)}
                >
                  <Text color="#000000" >
                    Subscribe
                  </Text>
                </Button>



              </Column>
              : <SubscribeForm setShowSubButton={setShowSubButton}/>
            }

            </Row>
          </Column>

          <Column

          mainAxisAlignment="center"
          crossAxisAlignment="center"
          height="100%"
          //width="50%"
          >

            <Image

            boxSize="210px"
            src={"/static/icons/BTC-Icon.svg"} //... idk why this doesnt work
            paddingRight="20px"
            />



          </Column>
        </Row>
      </DashboardBox>

    </>
  )
}


const SubscribeForm = ({setShowSubButton}) => {

  const submitEmail = (event) => {
    event.preventDefault()
    const email = event.target.email.value
    event.target.email.value = ''
    setShowSubButton(true)
    console.log("submitting email: ", email)

  }

  return (
    <Column paddingLeft="23px">
      <form onSubmit={submitEmail} >

          <FormControl id="email" colorScheme="whiteAlpha" width="200px" height="40px">
            <Input type="email" placeholder="email" />
          </FormControl>

      </form>
    </Column>


  )
}



export default SubscribeBox

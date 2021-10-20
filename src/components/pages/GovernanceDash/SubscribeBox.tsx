import { useTranslation } from 'next-i18next';
import { useIsVerySmall } from "hooks/useIsVerySmall";
import { useEffect, useState } from "react";
import { useIsSemiSmallScreen } from "hooks/useIsSemiSmallScreen"
import { useIsVeryVerySmall } from "hooks/useIsVeryVerySmall"
import { Row, Column, RowOrColumn } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { Heading, Box, Button, Text, Image }  from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage, FormHelperText, Input} from "@chakra-ui/react"


const SubscribeBox = () => {
  const { t } = useTranslation()
  const isMobile = useIsSemiSmallScreen()
  const isVerySmall = useIsVerySmall()
  const isVeryVerySmall = useIsVeryVerySmall()

  const [showSubButton, setShowSubButton] = useState(true)

  return(

    <>
      <Column width="100%" height="164px">

        <DashboardBox height="164px" width="100%" backgroundColor = "#000000" borderColor ="#4D4D4D">
          <RowOrColumn width="100%" isRow={!isVeryVerySmall} height="100%">

            <Column width={isVeryVerySmall ? "100%" : "70%"} height={isVeryVerySmall ? "50%" : "100%"} >
              <Column height = {isVeryVerySmall ? "100%" : "50%"} mainAxisAlignment="center">
                <Text fontSize={isVeryVerySmall ? "20px" : "25px"} pl={4} pt={4} pb={isVeryVerySmall ? 4 : 0} color="#858585" >
                  Subscribe to governance notifications
                </Text>
              </Column>
              { !isVeryVerySmall ?
                <Column pl={4} mainAxisAlignment="center" width="100%" height="50%">

                  {showSubButton ?
                      <Button
                      width="150px"
                      height="40px"
                      fontSize="13px"
                      borderRadius="7px"
                      onClick={() => setShowSubButton(false)}
                      >
                        <Text color="#000000" >
                          Subscribe
                        </Text>
                      </Button>


                    : <SubscribeForm setShowSubButton={setShowSubButton}/>
                  }
                </Column> : null
              }

            </Column>
            <RowOrColumn
            isRow={isVeryVerySmall}
            width={isVeryVerySmall ? "100%" : "30%"}
            height={isVeryVerySmall ? "50%" : "100%"}
            mainAxisAlignment="center"
            crossAxisAlignment="center"

            >
              { isVeryVerySmall ?
                <Column pl={4} mainAxisAlignment="center" width="100%" height="50%">
                  {showSubButton ?
                      <Button
                      width="150px"
                      height="40px"
                      fontSize="13px"
                      borderRadius="7px"
                      onClick={() => setShowSubButton(false)}
                      >
                        <Text color="#000000" >
                          Subscribe
                        </Text>
                      </Button>


                    : <SubscribeForm setShowSubButton={setShowSubButton}/>
                  }
                </Column> : null
              }

              <Image
              boxSize={isVeryVerySmall ? "80px" :"160px"}
              src={"/static/icons/BTC-Icon.svg"}
              pr={isVeryVerySmall ? 4 :4}
              pt={isVeryVerySmall ? 0 :4}
              pb={4}

              />
            </RowOrColumn>
          </RowOrColumn>

        </DashboardBox>
      </Column>

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
      <form onSubmit={submitEmail} >

          <FormControl id="email" colorScheme="whiteAlpha" width="150px" height="40px">
            <Input type="email" placeholder="email" />
          </FormControl>

      </form>


  )
}



export default SubscribeBox

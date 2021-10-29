// Charka and UI
import { ConfigRow, SaveButton } from "../../FusePoolEditPage"
import { SimpleTooltip } from "components/shared/SimpleTooltip"
import { Box, Text } from "@chakra-ui/layout"
import { QuestionIcon } from "@chakra-ui/icons"
import { useTranslation } from "react-i18next"
import { Input } from "@chakra-ui/react"
import { Row } from "utils/chakraUtils"
import { useState } from "react"
import { useQuery } from "react-query"
import { useRari } from "context/RariContext"
import { createComptroller } from "utils/createComptroller"
import { Button } from "@chakra-ui/button"
import { handleGenericError } from "utils/errorHandling"
import { useToast } from "@chakra-ui/toast"

const MarketCapConfigurator = ({
    comptrollerAddress,
    cTokenAddress,
    tokenSymbol,
    mode
    }: {
    comptrollerAddress: string,
    cTokenAddress: string | undefined,
    tokenSymbol: string | null
    mode: "Supply" | "Borrow"
}) => {
    const { t } = useTranslation()
    const [newSupplyCap, setNewSupplyCap] = useState<string>("");
    const { fuse, address } = useRari()
    const toast  = useToast()

    const comptroller = createComptroller(comptrollerAddress, fuse)

    const {data: supplyCap} = useQuery('Get ' + mode + ' cap for: ' + tokenSymbol , async () => {
        if (cTokenAddress) {
            if (mode === "Supply") {
                return await comptroller.methods.supplyCaps(cTokenAddress).call()
            }
            
            if (mode === "Borrow") {
                return await comptroller.methods.borrowCaps(cTokenAddress).call()
            }
        }
    })
    
    const handleSubmit = async (cTokenAddress: string[], newSupplyCap: number[]) => {

        try {

            if (mode === "Supply")
                await comptroller.methods._setMarketSupplyCaps(
                    cTokenAddress, 
                    newSupplyCap
                ).send({from: address})
            
            if(mode === "Borrow") 
                await comptroller.methods._setMarketBorrowCaps(
                    cTokenAddress, 
                    newSupplyCap
                ).send({from: address})
            
            toast({
                title: "Success!",
                description: "You've updated the asset's" + mode + " cap.",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "top-right",
            }
            )
        } catch (e) {
            handleGenericError(e, toast)
        }
    }
    return (
        <>
        <Row
            mainAxisAlignment="center"
            justifyContent="space-between"
            crossAxisAlignment="center"
            width="100%"
            my={4}
            px={4}
            
            height="100%"
            >
            <SimpleTooltip
                label={t(
                "Sets cap for the market. Users will not be able to supply/borrow once the cap is met."
                )}
            >
                <Text fontWeight="bold">
                {mode  + " caps"} <QuestionIcon ml={1} mb="4px" />
                </Text>
            </SimpleTooltip>
            <Box
                width="50%"
                height="auto"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="flex-end"
                alignContent="center"
            >
                <Input 
                    width="150px"
                    height="30px"
                    extAlign="center"
                    mb={newSupplyCap !== "" ? 5 : 0}
                    placeholder={supplyCap > 0 ? parseInt(supplyCap).toLocaleString() + " " + tokenSymbol : t(
                        "Supply Cap in $"
                    )}
                    type="number"
                    size="sm"
                    value={newSupplyCap} 
                    onChange={(event) => {
                        setNewSupplyCap(event.target.value);
                    }}
                />
            

            {
                newSupplyCap !== "" ? 
                (<Box
                    height="100%"
                    width="100%"
                    display='flex'
                    justifyContent="flex-end"
                    flexDirection="column"
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignContent="center"
                    >
                        <Text size="sm" opacity="0.7">
                            New supply cap:
                        </Text>
                        <Box
                            height="100%"
                            width="40%"
                        >
                            <Text opacity="0.5" textAlign="end">
                                {tokenSymbol} {parseInt(newSupplyCap).toLocaleString()}
                            </Text>
                        </Box>
                    </Box>
                    
                    { supplyCap === '0' ? null :
                    <Box
                    display="flex"
                    justifyContent="space-between"
                    alignContent="center">
                        <Text size="sm" opacity="0.7">
                            Current supply cap:
                        </Text>
                        <Box
                            height="100%"
                            width="40%"
                        >
                            <Text opacity="0.5" textAlign="end">
                                {tokenSymbol} {parseInt(supplyCap).toLocaleString()}
                            </Text>
                        </Box>
                    </Box> }
                    <SaveButton 
                            mt="2"
                            ml="auto"
                            onClick={() => handleSubmit([cTokenAddress ?? "0"], [parseInt(newSupplyCap)])}
                            fontSize="xs"
                            altText={"Submit"
                        }
                    />

                </Box>)
                : null

            }
            
            </Box>
        </Row>
      </>
    )
}

export default MarketCapConfigurator
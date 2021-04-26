
import React from 'react'
import {
    Box,
    Tr,
    Td,
    Text
} from '@chakra-ui/react';
import { motion } from 'framer-motion'
import { Column } from 'buttered-chakra';
import { TranchesLogoSVGWhite } from 'components/shared/Logos';
import { SimpleTooltip } from "components/shared/SimpleTooltip";


const TranchesRow = ({ estimatedSFI, daiSPrincipal, daiAPrincipal }) => {

    return (
        <motion.tr 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
         >

            <Td textAlign="center">
                <SimpleTooltip label="Tranches" placement="right">
                    <Box width="30px" >
                        <TranchesLogoSVGWhite width="25px" height="25px" />
                    </Box>
                </SimpleTooltip>
            </Td>
            <Td>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                    <Box mb={3}>
                        <Text> DAI-S </Text>
                    </Box>
                    <Box mb={3}>
                        <Text> DAI-A </Text>
                    </Box>
                </Column>
            </Td>
            <Td >
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                    <Box mb={3}>
                        <Text textAlign="left">  {daiSPrincipal} DAI </Text>
                    </Box>
                    <Box mb={3}>
                        <Text textAlign="left"> {daiAPrincipal} DAI </Text>
                    </Box>
                </Column>
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                    <Box mb={3}>
                        <Text textAlign="left">  {estimatedSFI?.formattedAPoolSFIEarned} </Text>
                    </Box>
                    <Box mb={3}>
                        <Text textAlign="left"> {estimatedSFI?.formattedSPoolSFIEarned}  </Text>
                    </Box>
                </Column>
            </Td>
            <Td>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                    <Box mb={3}>
                        <Text> N/A</Text>
                    </Box>
                </Column>
            </Td>
        </motion.tr >

    )
}

export default TranchesRow

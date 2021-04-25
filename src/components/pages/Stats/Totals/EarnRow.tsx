
import React from 'react'
import {
    Box,
    Tr,
    Td,
    Text
} from '@chakra-ui/react';
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { EarnLogoSVG } from 'components/shared/Logos';

const EarnRow = ({ poolsInfo }: { poolsInfo: any }) => {

    return (
        <Tr>
            <Td>
                <SimpleTooltip label="Earn" placement="right">
                    <Box width="30px">
                        <EarnLogoSVG  width="26px" height="26px" />
                    </Box>
                </SimpleTooltip>

            </Td>
            <Td>
                {poolsInfo.map(({ poolInfo }) => (
                    <Text mb={3} key={poolInfo.title}>{poolInfo.title}</Text>
                ))}
            </Td>
            <Td >
                {poolsInfo.map(({ formattedPoolBalance }, i) => (
                    <Text mb={3} key={i}> {formattedPoolBalance}</Text>
                ))}
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
                <Text mb={3}>N/A</Text>
                <Text mb={3}>N/A</Text>
                <Text mb={3}>N/A</Text>
            </Td>
            <Td>
                {poolsInfo.map(({ formattedPoolInterestEarned }, i) => (
                    <Text mb={3} key={i}>{formattedPoolInterestEarned}</Text>
                ))}
            </Td>
        </Tr>
    )
}

export default EarnRow

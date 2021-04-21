
import React from 'react'
import {
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Text
} from '@chakra-ui/react';

const EarnRow = ({ poolsInfo }: { poolsInfo: any }) => {

    return (
        <Tr>
            <Td>Earn</Td>
            <Td>
                {poolsInfo.map(({ poolInfo }) => (
                    <Text mb={3}>{poolInfo.title}</Text>
                ))}
            </Td>
            <Td >
                {poolsInfo.map(({ formattedPoolBalance }) => (
                    <Text mb={3}>{formattedPoolBalance}</Text>
                ))}
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
                <Text mb={3}>0 RGT</Text>
                <Text mb={3}>0 RGT</Text>
                <Text mb={3}>0 RGT</Text>
            </Td>
            <Td>
                {poolsInfo.map(({ formattedPoolInterestEarned }) => (
                    <Text mb={3}>{formattedPoolInterestEarned}</Text>
                ))}
            </Td>
        </Tr>
    )
}

export default EarnRow

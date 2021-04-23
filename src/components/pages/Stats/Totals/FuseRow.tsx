
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

const FuseRow = () => {

    return (
        <Tr>
            <Td>Fuse</Td>
            <Td>
                {/* {poolsInfo.map(({ poolInfo }) => (
                    <Text mb={3} key={poolInfo.title}>{poolInfo.title}</Text>
                ))} */}
            </Td>
            <Td >
                {/* {poolsInfo.map(({ formattedPoolBalance }, i) => (
                    <Text mb={3} key={i}> {formattedPoolBalance}</Text>
                ))} */}
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
                <Text mb={3}>N/A</Text>
                <Text mb={3}>N/A</Text>
                <Text mb={3}>N/A</Text>
            </Td>
            <Td>
                {/* {poolsInfo.map(({ formattedPoolInterestEarned }, i) => (
                    <Text mb={3} key={i}>{formattedPoolInterestEarned}</Text>
                ))} */}
            </Td>
        </Tr>
    )
}

export default FuseRow

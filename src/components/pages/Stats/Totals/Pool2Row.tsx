
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

const EarnRow = ({ apr, earned, balance }: { apr: any, earned: any, balance: any }) => {

    return (
        <Tr>
            <Td>Pool2</Td>
            <Td>
                RGT-ETH
            </Td>
            <Td >
                {balance?.SLP?.toFixed(2)} RGT-ETH
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
               {earned.toFixed(2)} RGT
            </Td>
            <Td>
                N/A
            </Td>
        </Tr>
    )
}

export default EarnRow

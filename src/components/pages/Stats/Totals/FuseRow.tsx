
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

import { shortUsdFormatter, smallStringUsdFormatter } from 'utils/bigUtils';

const FuseRow = ({ filteredPoolsData, fusePoolsData }) => {


    return (
        <Tr>
            <Td>Fuse</Td>
            <Td>
                {filteredPoolsData?.map(({ id }) => (
                    <Text mb={3} key={id}>{id}</Text>
                ))}
            </Td>
            <Td >
                {filteredPoolsData?.map(({ id, suppliedUSD }) => (
                    <Text mb={3} key={id}>{smallStringUsdFormatter(suppliedUSD)}</Text>
                ))}
            </Td>
            {/* Todo (sharad) - implement RGT earned in poolInfo */}
            <Td>
                {filteredPoolsData?.map(({ id }) => (
                    <Text mb={3} key={id}>N/A</Text>
                ))}
            </Td>
            <Td>
                {filteredPoolsData?.map(({ id }) => (
                    <Text mb={3} key={id}>N/A</Text>
                ))}
            </Td>
        </Tr>
    )
}

export default FuseRow

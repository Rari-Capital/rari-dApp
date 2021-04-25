
import React from 'react'
import {
    Tr,
    Td,
} from '@chakra-ui/react';
import { Pool2LogoSVG } from 'components/shared/Logos';

const EarnRow = ({ apr, earned, balance }: { apr: any, earned: any, balance: any }) => {

    return (
        <Tr>
            <Td><Pool2LogoSVG  width="25px" height="25px"/></Td>
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

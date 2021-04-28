import React from 'react'

import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

// import { useTokenData } from "hooks/useTokenData";

// TODO - not in use - create generalized component
// Currently being written in the StatsFuseSection component.
const AssetContainer = ({ 
    address, 
    topString, 
    bottomString, 
    symbol }: { asset: USDPricedFuseAsset, logoURL: string }) => {

    return (

        <>
            <Column
                mainAxisAlignment={'center'}
                crossAxisAlignment="flex-end"
            >
                {/* Icon and Units */}
                <Row
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    width="90%"
                >
                    <Avatar
                        bg="#FFF"
                        boxSize="30px"
                        name={symbol ?? "Loading..."}
                        my="auto"
                        mr="auto"
                        src={
                            logoURL ??
                            "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
                        }
                    />
                    {/* Lend/borrow Supply */}
                    <Text>{topString}</Text>

                </Row>
                {/* USD Denomination */}
                <Row
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    width="100%"
                >
                    <Text p={1} fontSize="sm" color="grey">
                        {bottomString}
                    </Text>
                </Row>
            </Column>
        </>
    )
}
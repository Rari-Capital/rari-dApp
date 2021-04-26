import React from 'react'

import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

import { useTokenData } from "hooks/useTokenData";



const AssetContainer = ({ address, topString, bottomString, symbol }: { asset: USDPricedFuseAsset, logoURL: string }) => {

    const d = useTokenData('0x6b175474e89094c44da98b954eedeac495271d0f')

    console.log({ d })


    // const { underlyingSymbol } = asset

    // const supplyAmount = asset.supplyBalance / (10 ** asset.underlyingDecimals)
    // const borrowAmount = asset.borrowBalance / (10 ** asset.underlyingDecimals)
    // const formattedSupplyAmount = supplyAmount.toFixed(2) + ` ${asset.underlyingSymbol}`
    // const formattedBorrowAmount = borrowAmount.toFixed(2) + ` ${asset.underlyingSymbol}`
    // const supplyBalanceUSD = shortUsdFormatter(asset.supplyBalanceUSD)
    // const borrowBalanceUSD = shortUsdFormatter(asset.borrowBalanceUSD)

    // const borrowRate = convertMantissaToAPR(asset.borrowRatePerBlock).toFixed(2)
    // const supplyRate = convertMantissaToAPY(asset.supplyRatePerBlock, 365).toFixed(2)

    // console.log(asset.underlyingSymbol, { supplyAmount, borrowAmount })

    return (

        <>
            <Column
                mainAxisAlignment={'center'}
                crossAxisAlignment="flex-end"
            // background="lime"
            >
                {/* Icon and Units */}
                <Row
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    width="90%"
                // pl={6}
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
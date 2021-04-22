import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "rari-sdk/index";
import Fuse from "fuse-sdk";

export const fetchFuseTotalBorrowAndSupply = async (
    { rari, fuse, address }: { rari: Rari, fuse: Fuse, address: string }
) => {

    const [{ 0: supplyETH, 1: borrowETH }, ethPrice] = await Promise.all([
        fuse.contracts.FusePoolLens.methods
            .getUserSummary(address)
            .call({ gas: 1e18 }),

        rari.web3.utils.fromWei(await rari.getEthUsdPriceBN()) as any,
    ]);

    return {
        totalSuppliedUSD: (supplyETH / 1e18) * ethPrice,
        totalBorrowedUSD: (borrowETH / 1e18) * ethPrice,
    };
};


export const useFuseTotalBorrowAndSupply = () => {
    const { rari, fuse, address } = useRari();

    const { data, isLoading, isError } = useQuery(
        address + " totalBorrowAndSupply",
        async () => fetchFuseTotalBorrowAndSupply({ rari, fuse, address })
    );

    return { data, isLoading, isError }

}
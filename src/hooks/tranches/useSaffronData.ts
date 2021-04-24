
import { useQuery } from "react-query";
import { useSaffronContracts } from "components/pages/Tranches/SaffronContext";


export const useSaffronData = () => {
    const { data } = useQuery("saffronData", async () => {
        return (await fetch("https://api.spice.finance/apy")).json();
    });

    const contracts = useSaffronContracts();

    const fetchCurrentEpoch = async () => {
        const currentEpoch = await contracts.saffronPool.methods
            .get_current_epoch()
            .call();

        return currentEpoch;
    };

    return {
        saffronData: data as {
            SFI: { USD: number };
            pools: {
                name: string;
                tranches: { A: { "total-apy": number }; S: { "total-apy": number } };
            }[];
        },
        fetchCurrentEpoch,
        ...contracts,
    };
}

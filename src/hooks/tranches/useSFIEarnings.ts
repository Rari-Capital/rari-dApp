
import { useQuery } from "react-query";
import { useSaffronData } from "./useSaffronData";

export const useSFIEarnings = () => {

    const { saffronPool } = useSaffronData();

    const { data } = useQuery(
        "sfiEarnings",
        async () => {
            const {
                S,
                AA,
                A,
            } = await saffronPool.methods.TRANCHE_SFI_MULTIPLIER().call();

            return { S: S / 1000, AA: AA / 1000, A: A / 1000 };
        });

    return data
}

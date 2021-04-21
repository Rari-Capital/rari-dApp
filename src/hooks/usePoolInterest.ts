import { useMemo } from "react";
import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import { fetchPoolInterestEarned } from "../utils/fetchPoolInterest";

export const usePoolInterestEarned = () => {
    const { rari, address } = useRari();

    const { data } = useQuery(
        address + " interest earned",
        () => {
            return fetchPoolInterestEarned(rari, address);
        });

    return data;
};

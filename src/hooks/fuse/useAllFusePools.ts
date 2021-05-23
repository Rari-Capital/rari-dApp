import { useFusePoolsData } from "hooks/useFusePoolData";
import { useFusePools, UseFusePoolsReturn } from "./useFusePools";

const useAllFusePools = () => {
  const { pools } = useFusePools(null);
  const fusePoolsData = useFusePoolsData(pools?.map(({ id }) => id) ?? []);
  return fusePoolsData;
};

export default useAllFusePools;

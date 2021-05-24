
// Utils
import { FusePoolData } from "utils/fetchFusePoolData";

// Hooks
import { useFusePoolsData } from "hooks/useFusePoolData";
import { useFusePools } from "./useFusePools";

const useAllFusePools = (): FusePoolData[] | null => {
  const { pools } = useFusePools(null);
  const fusePoolsData = useFusePoolsData(pools?.map(({ id }) => id) ?? []);
  return fusePoolsData;
};

export default useAllFusePools;

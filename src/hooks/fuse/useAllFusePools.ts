
// Utils
import { FusePoolData } from "utils/fetchFusePoolData";

// Hooks
import { useFusePoolsData } from "hooks/useFusePoolData";
import { useFusePools } from "./useFusePools";

const useAllFusePools = (): FusePoolData[] | null => {
  
  // We have to get a list of all the fuse pools first.
  const { pools } = useFusePools(null);

  // Then we use the fuse pool IDs to go and fetch ALL the data about each Fuse pool.
  // Todo - ideally we should be doing this all in one fetch. 
  const fusePoolsData = useFusePoolsData(pools?.map(({ id }) => id) ?? []);
  return fusePoolsData;
};

export default useAllFusePools;

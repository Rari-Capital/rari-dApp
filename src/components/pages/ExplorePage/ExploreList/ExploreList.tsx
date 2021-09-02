// Utils
import { Column } from "lib/chakraUtils";

// Types
import { ExploreNavType } from "../ExplorePage";

import FuseList  from "components/shared/Lists/Fuse/FuseList";
import { AllAssetsList } from "components/shared/Lists/AssetsList";
import VaultsList from "components/shared/Lists/VaultsList";

const PoolList = ({ nav }: { nav: ExploreNavType }) => {
  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
    >
      {nav === ExploreNavType.FUSE && <FuseList />}
      {nav === ExploreNavType.EARN && <VaultsList />}
      {nav === ExploreNavType.ALL && <AllAssetsList />}
    </Column>
  );
};

export default PoolList;

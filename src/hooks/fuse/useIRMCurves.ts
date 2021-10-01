
// Rari
import { useRari } from "context/RariContext";

// Hooks
import { useQuery } from "react-query";

// Utils
import { convertIRMtoCurve } from "components/pages/Fuse/FusePoolInfoPage";

const useIRMCurves = ({
    interestRateModel,
    adminFee,
    reserveFactor,
  }: {
    interestRateModel: any;
    adminFee: any;
    reserveFactor: any;
  }) => {
    const { fuse } = useRari();
  
    // Get IRM curves
    const { data: curves } = useQuery(
      interestRateModel + adminFee + reserveFactor + " irm",
      async () => {
        const IRM = await fuse.identifyInterestRateModel(interestRateModel);
  
        if (IRM === null) {
          return null;
        }
  
        await IRM._init(
          fuse.web3,
          interestRateModel,
          // reserve factor
          reserveFactor * 1e16,
          // admin fee
          adminFee * 1e16,
          // hardcoded 10% Fuse fee
          0.1e18
        );
  
        return convertIRMtoCurve(IRM, fuse);
      }
    );
  
    return curves;
  };

export default useIRMCurves
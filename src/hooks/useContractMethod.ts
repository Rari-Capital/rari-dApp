import { useQuery } from "react-query";
import { Contract } from "web3-eth-contract";

export function useContractMethod<DataType>(
  contract: Contract,
  methodKey: string,
  resultTransformFunc?: (result: any) => DataType,
  ...parameters: any[]
) {
  return useQuery<DataType, [string, ...any[]]>(
    [methodKey, ...parameters],
    () => {
      let result = contract.methods[methodKey](...parameters).call();

      if (resultTransformFunc) {
        result = result.then(resultTransformFunc);
      }

      return result;
    }
  );
}

import { useQuery } from "react-query";
import { Contract } from "web3-eth-contract";

export function useContractMethod<T, A>(
  contract: Contract,
  methodKey: string,
  resultTransformFunc?: (result: T) => A,
  ...parameters: any[]
) {
  return useQuery<A, [string, ...any[]]>([methodKey, ...parameters], () => {
    let result = contract.methods[methodKey](...parameters).call();

    if (resultTransformFunc) {
      result = result.then(resultTransformFunc);
    }

    return result;
  });
}

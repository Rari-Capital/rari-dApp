import { useQuery } from "react-query";
import { Contract } from "web3-eth-contract";

export function useContractMethod<T, A>(
  contract: Contract,
  methodKey: string,
  resultTransformFunc?: (result: T) => A
) {
  return useQuery<A, string>(methodKey, () => {
    let result = contract.methods[methodKey]().call();

    if (resultTransformFunc) {
      result = result.then(resultTransformFunc);
    }

    return result;
  });
}

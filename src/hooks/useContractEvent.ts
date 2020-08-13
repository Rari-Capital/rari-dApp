import { useQuery } from "react-query";
import { Contract, Filter, EventData } from "web3-eth-contract";

export function usePastContractEvents<DataType = EventData[]>(
  contract: Contract,
  eventType: string | "allEvents",
  filter: Filter,
  eventsTransform?: (events: EventData[]) => DataType
) {
  return useQuery<DataType, [string, ...any[]]>(
    [
      "pastEvents",
      eventType,
      contract.options.address,
      filter,
      eventsTransform,
    ],
    async () => {
      let events = await contract.getPastEvents(eventType, {
        fromBlock: "earliest",
        filter,
      });

      if (eventsTransform) {
        return eventsTransform(events);
      } else {
        return (events as unknown) as DataType;
      }
    }
  );
}

export function useTransactionHistoryEvents(
  rariFundManager: Contract,
  address: string
) {
  return useQuery<EventData[], "transactionHistoryEvents">(
    "transactionHistoryEvents",
    async () => {
      const withdraws = await rariFundManager.getPastEvents("Withdrawal", {
        fromBlock: "earliest",
        filter: { payee: address },
      });

      const deposits = await rariFundManager.getPastEvents("Deposit", {
        fromBlock: "earliest",
        filter: { payee: address },
      });

      let merged_arrays = withdraws.concat(deposits);

      // Sort descending by blockNumber
      merged_arrays.sort((a, b) => (a.blockNumber < b.blockNumber ? 1 : -1));

      return merged_arrays;
    }
  );
}

import { useQuery, queryCache } from "react-query";
import { Contract, Filter, EventData } from "web3-eth-contract";

import { useAuthedWeb3 } from "../context/Web3Context";
import { createAllFundManagerContracts } from "../utils/contractUtils";
import Web3 from "web3";

export function usePastContractEvents<DataType = EventData[]>(
  contract: Contract,
  eventType: string | "allEvents",
  filter: Filter,
  eventsTransform?: (events: EventData[]) => DataType
) {
  return useQuery(
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

export type TransactionEvent = EventData & { timeSent: string };

async function getPastPayeeEventsFromAllFundManagers(
  event: string,
  address: string,
  web3: Web3
) {
  return (
    await Promise.all(
      createAllFundManagerContracts(web3).map((contract) => {
        return contract.getPastEvents(event, {
          fromBlock: "earliest",
          filter: { payee: address },
        });
      })
    )
  ).flat();
}

export function useTransactionHistoryEvents() {
  const { web3, address } = useAuthedWeb3();

  return useQuery("transactionHistoryOf" + address, async () => {
    const withdraws = await getPastPayeeEventsFromAllFundManagers(
      "Withdrawal",
      address,
      web3
    );

    const deposits = await getPastPayeeEventsFromAllFundManagers(
      "Deposit",
      address,
      web3
    );

    let merged_arrays = await Promise.all(
      withdraws.concat(deposits).map(async (event) => {
        const block = await web3.eth.getBlock(event.blockNumber);

        const date = new Date(parseInt(block.timestamp as string) * 1000);

        return {
          ...event,
          timeSent: date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        } as TransactionEvent;
      })
    );

    // Sort descending by blockNumber
    merged_arrays.sort((a, b) => (a.blockNumber < b.blockNumber ? 1 : -1));

    if (
      merged_arrays.length > 0 &&
      (merged_arrays[0].event === undefined ||
        merged_arrays[0].signature === null)
    ) {
      // If the event data is broken, we reload the page.
      console.log("Event data broken, reloading!");
      queryCache.clear();
      window.location.reload();
      return [];
    } else {
      return merged_arrays;
    }
  });
}

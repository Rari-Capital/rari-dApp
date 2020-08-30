import React, { useState, useEffect, useRef } from "react";

const useInterval = (callback: () => any, delay: number | null) => {
  const savedCallback = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallback.current(...args);

    if (delay !== null) {
      const id = setInterval(handler, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

interface Props {
  length: number;
  renderItem: (index: number) => JSX.Element;
  chunkAmount: number;
  chunkDelayMs: number;
  initalChunkAmount?: number;
}

const SlowlyLoadedList = (props: Props) => {
  const [itemsToLoad, setItemsToLoad] = useState(
    props.initalChunkAmount ?? props.chunkAmount
  );

  useInterval(
    () => {
      let amountToSet = itemsToLoad + props.chunkAmount;

      if (amountToSet > props.length) {
        amountToSet = props.length;
      }

      setItemsToLoad(amountToSet);
    },
    itemsToLoad < props.length ? props.chunkDelayMs : null
  );

  return (
    <>
      {Array.from({ length: itemsToLoad }).map((_, index) =>
        props.renderItem(index)
      )}
    </>
  );
};

export default SlowlyLoadedList;

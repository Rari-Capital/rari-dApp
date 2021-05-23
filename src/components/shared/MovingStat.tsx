import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import CaptionedStat, { CaptionedStatProps } from "./CaptionedStat";

export function useInterval(callback: () => any, delay: number) {
  const intervalId = React.useRef<null | number>(null);
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  });
  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalId.current = window.setInterval(tick, delay);
      return () => {
        window.clearInterval(intervalId.current!);
      };
    }
  }, [delay]);
  return intervalId.current;
}

type RefetchMovingStatProps = Omit<CaptionedStatProps, "stat"> & {
  queryKey: string;
  /** In milliseconds like: 1000, 500, 20, 10, 221 */
  interval: number;
  fetch: () => Promise<string>;
  loadingPlaceholder: string;
};

export const RefetchMovingStat = React.memo(
  ({
    interval,
    loadingPlaceholder,
    queryKey,
    fetch,
    ...statProps
  }: RefetchMovingStatProps) => {
    const { data } = useQuery(queryKey, fetch, {
      refetchInterval: interval,
    });

    return <CaptionedStat {...statProps} stat={data ?? loadingPlaceholder} />;
  }
);

type APYMovingStatProps = Omit<CaptionedStatProps, "stat"> & {
  startingAmount: number;

  /** This should be a percent like: 0.1, 0.08, 0.12, 0.192 */
  apy: number;

  /** This should be in milliseconds like: 1000, 200, 100, 20 */
  interval: number;

  formatStat: (num: number) => string;
};

export const APYMovingStat = React.memo(
  ({
    startingAmount,
    formatStat,
    interval,
    apy,
    ...statProps
  }: APYMovingStatProps) => {
    const increasePerInterval = useMemo(() => {
      const percentIncreasePerMillisecond = apy / 365 / 24 / 60 / 60 / 1000;

      const percentIncreasePerInterval =
        percentIncreasePerMillisecond * interval;

      return percentIncreasePerInterval;
    }, [interval, apy]);

    const [currentStat, setCurrentStat] = useState(startingAmount);

    const formattedStat = useMemo(
      () => formatStat(currentStat),
      [formatStat, currentStat]
    );

    useInterval(() => {
      setCurrentStat((past) => past + past * increasePerInterval);
    }, interval);

    return <CaptionedStat {...statProps} stat={formattedStat} />;
  }
);

type APYWithRefreshMovingProps = Omit<
  Omit<APYMovingStatProps, "interval">,
  "startingAmount"
> &
  Omit<Omit<RefetchMovingStatProps, "interval">, "fetch"> & {
    fetch: () => Promise<number>;
    fetchInterval: number;
    apyInterval: number;
  };

export const APYWithRefreshMovingStat = React.memo(
  ({
    queryKey,
    formatStat,
    fetchInterval,
    apyInterval,
    loadingPlaceholder,
    fetch,
    apy,
    ...statProps
  }: APYWithRefreshMovingProps) => {
    const increasePerInterval = useMemo(() => {
      const percentIncreasePerMillisecond = apy / 365 / 24 / 60 / 60 / 1000;

      const percentIncreasePerInterval =
        percentIncreasePerMillisecond * apyInterval;

      return percentIncreasePerInterval;
    }, [apyInterval, apy]);

    const [currentStat, setCurrentStat] = useState(0);

    const formattedStat = useMemo(
      () => formatStat(currentStat),
      [formatStat, currentStat]
    );

    useInterval(() => {
      setCurrentStat((past) => past + past * increasePerInterval);
    }, apyInterval);

    const { data } = useQuery(queryKey, fetch, {
      refetchInterval: fetchInterval,
    });

    useEffect(() => {
      if (data) {
        setCurrentStat(data);
      }
    }, [data]);

    return (
      <CaptionedStat
        {...statProps}
        stat={!data ? loadingPlaceholder : formattedStat}
      />
    );
  }
);

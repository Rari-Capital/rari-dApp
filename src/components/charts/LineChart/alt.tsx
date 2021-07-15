import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { ResponsiveContainer, XAxis, Tooltip, AreaChart, Area } from "recharts";
import { darken } from "polished";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import usePrevious from "hooks/usePrevious";
import { MarketInterval } from "hooks/tokens/useTokenMarketInfo";
dayjs.extend(utc);

const DEFAULT_HEIGHT = 300;

export type LineChartProps = {
  data: any[] | undefined;
  marketInterval: MarketInterval;
  color?: string | undefined;
  height?: number | undefined;
  minHeight?: number;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for label of valye
  value?: number;
  label?: string;
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const Chart = ({
  data,
  marketInterval,
  color = "#56B2A4",
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const parsedValue = value;
  const dataPrev = usePrevious(data);

  // Don't flash screen if data is undefined. use previous data
  const chartData = useMemo(() => {
    return !data ? (dataPrev ? dataPrev : undefined) : data;
  }, [data, dataPrev]);


  // Used on X-Axis
  const timeFormatter = useCallback(
    (unixTime: number) => {
      let format;
      switch (marketInterval) {
        case MarketInterval.DAY:
          format = "hh";
          break;
        case MarketInterval.WEEK:
          format = "DD";
          break;
        case MarketInterval.MONTH:
          format = "DD-MM";
          break;
        default:
          format = "MM/YY";
          break;
      }

      return dayjs(unixTime).format(format);
    },
    [marketInterval]
  );


 const onMouseHover = useCallback(
   (
    value: number,
    name: string,
    props: { payload: { time: string; value: number } }
  ) => {
    if (setValue && parsedValue !== props.payload.value) {
      setValue(props.payload.value);
    }
    const formattedTime = dayjs(props.payload.time).format(
      "MMM D, YYYY"
    );
    if (setLabel && label !== formattedTime) setLabel(formattedTime);
  },
  [setValue, setLabel, label, parsedValue]
 ) 

  return (
    <ResponsiveContainer width="99%" height="100%">
      <AreaChart
        // width={500}
        // height={300}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        onMouseLeave={() => {
          setLabel && setLabel(undefined);
          setValue && setValue(undefined);
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={darken(0.36, color)}
              stopOpacity={0.5}
            />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tickFormatter={timeFormatter}
          minTickGap={10}
        />
        {/* <Tooltip /> */}
        <Tooltip
          cursor={{ stroke: "pink" }}
          contentStyle={{display: 'none'}}
          formatter={onMouseHover}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke={color}
          fill="url(#gradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;

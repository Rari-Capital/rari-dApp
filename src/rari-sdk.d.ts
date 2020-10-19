declare module "rari-sdk" {
  export function interestEarnedDuringRange(
    range: "week" | "month" | "year" | "all-time"
  ): number;

  export function accountBalanceEachDayDuringRange(
    range: "week" | "month" | "year" | "all-time"
  ): number[];

  export function getRGTApy(): number;

  export function getFundPerformanceDuringRange(
    range: "week" | "month" | "year" | "all-time"
  ): { eth: number[]; yield: number[]; stable: number[] };
}

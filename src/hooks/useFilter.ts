import { useRouter } from "next/router";

export function useFilter() : string | undefined {
  const router = useRouter();
  const { filter } = router.query

  // Check if the query params are an array
  if (typeof filter === "object") return filter[0]

  // Else return the filter or null
  else return filter ?? undefined;
}

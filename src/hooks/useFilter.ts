import { useRouter } from "next/router";

export function useFilter() : string | null {
  const router = useRouter();
  const { filter } = router.query

  // Check if its an array
  if (typeof filter === "object") return filter[0]

  // Else return the filter or null
  else return filter ?? null;
}

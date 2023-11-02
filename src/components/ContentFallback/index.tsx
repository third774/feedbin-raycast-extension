import { Detail } from "@raycast/api";
import { useExec } from "@raycast/utils";

export function ContentFallback() {
  const { data, isLoading } = useExec(`echo sup`, {});

  return <Detail isLoading={isLoading} markdown={data} />;
}

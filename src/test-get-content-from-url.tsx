import { Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { getEntryContentWithFallback } from "./utils/getContentFromUrl";

export default function TestGetContentFromURL(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<any>();

  useEffect(() => {
    getEntryContentWithFallback(
      "https://chriscoyier.net/2023/11/02/what-is-modern/",
    ).then(setContent);
  }, []);

  return <Detail isLoading={content === undefined} markdown={content} />;
}

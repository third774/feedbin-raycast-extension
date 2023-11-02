import { Action, ActionPanel, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { getEntryContentWithFallback } from "../utils/getContentFromUrl";
import { ActionAiSummary } from "./ActionAiSummary";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface EntryContentProps {
  entry: Entry;
}

export function EntryContent(props: EntryContentProps) {
  const { subscriptionMap } = useFeedbinApiContext();
  const [content, setContent] = useState<string>();

  useEffect(() => {
    getEntryContentWithFallback(props.entry).then(setContent);
  }, []);

  return (
    <Detail
      isLoading={content === undefined}
      markdown={content ?? ""}
      navigationTitle={props.entry.title ?? props.entry.url}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={props.entry.url} />
          <ActionAiSummary entry={props.entry} />
          <ActionCopyUrlToClipboard url={props.entry.url} />
          <ActionViewSubscription
            feedName={subscriptionMap[props.entry.feed_id]?.title}
            entry={props.entry}
          />
          <ActionStarToggle id={props.entry.id} />
          <ActionMarkAsRead id={props.entry.id} />
        </ActionPanel>
      }
    />
  );
}

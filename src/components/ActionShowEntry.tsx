import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { NodeHtmlMarkdown } from "node-html-markdown";
import {
  FeedbinApiContextProvider,
  useFeedbinApiContext,
} from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { ActionAiSummary } from "./ActionAiSummary";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionOpenInBrowser } from "./ActionOpenInBrowser";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionUnsubscribe } from "./ActionUnsubscribe";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface ActionShowEntryProps {
  entry: Entry;
}

export function ActionShowEntry(props: ActionShowEntryProps) {
  const { subscriptionMap } = useFeedbinApiContext();
  if (props.entry.content === null) return null;
  return (
    <Action.Push
      title="View in Raycast"
      icon={Icon.RaycastLogoNeg}
      target={
        <FeedbinApiContextProvider>
          <Detail
            markdown={NodeHtmlMarkdown.translate(props.entry.content)}
            navigationTitle={props.entry.title ?? props.entry.url}
            actions={
              <ActionPanel>
                <ActionOpenInBrowser url={props.entry.url} />
                <ActionAiSummary entry={props.entry} />
                <ActionCopyUrlToClipboard url={props.entry.url} />
                <ActionViewSubscription
                  feedName={subscriptionMap[props.entry.feed_id]?.title}
                  entry={props.entry}
                />
                <ActionStarToggle id={props.entry.id} />
                <ActionMarkAsRead id={props.entry.id} />
                <ActionUnsubscribe feedId={props.entry.feed_id} />
              </ActionPanel>
            }
          />
        </FeedbinApiContextProvider>
      }
    />
  );
}

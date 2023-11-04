import {
  AI,
  Action,
  ActionPanel,
  Detail,
  Icon,
  environment,
} from "@raycast/api";
import { useAI } from "@raycast/utils";
import parse from "node-html-parser";
import {
  FeedbinApiContextProvider,
  useFeedbinApiContext,
} from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionDebugJson } from "./ActionDebugJson";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionOpenEntryAndMarkAsRead } from "./ActionOpenEntryAndMarkAsRead";
import { ActionOpenInBrowser } from "./ActionOpenInBrowser";
import { ActionShowEntry } from "./ActionShowEntry";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionUnsubscribe } from "./ActionUnsubscribe";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface ActionAiSummaryProps {
  entry: Entry;
}

export function ActionAiSummary(props: ActionAiSummaryProps) {
  if (!props.entry.content || !environment.canAccess(AI)) {
    return null;
  }

  return (
    <Action.Push
      title="View AI Summary"
      icon={Icon.Stars}
      target={
        <FeedbinApiContextProvider parentContext={useFeedbinApiContext()}>
          <DetailSummarized entry={props.entry} />
        </FeedbinApiContextProvider>
      }
    />
  );
}

const prompt = (content: string) =>
  `INSTRUCTIONS:
Summarize the CONTENT below:
---

CONTENT:
${content}

---

---
SUMMARY:
`;

const promptLength = prompt("").length;

export function DetailSummarized(props: { entry: Entry }) {
  // strip content down to text because some posts may contain
  // tons of links which may eat into the 10k character limit
  const content = parse(props.entry.content ?? "").textContent;
  const promptText = prompt(content.substring(0, 9999 - promptLength));
  const { data, isLoading } = useAI(promptText, {
    creativity: 0,
    execute: props.entry.content !== null,
  });

  const { subscriptionMap } = useFeedbinApiContext();

  return (
    <Detail
      markdown={data}
      isLoading={isLoading}
      navigationTitle={
        props.entry.title ?? props.entry.summary ?? props.entry.url
      }
      actions={
        <ActionPanel>
          <ActionOpenInBrowser url={props.entry.url} />
          <ActionShowEntry entry={props.entry} />
          <ActionCopyUrlToClipboard url={props.entry.url} />
          <ActionViewSubscription
            feedName={subscriptionMap[props.entry.feed_id]?.title}
            entry={props.entry}
          />
          <ActionStarToggle id={props.entry.id} />
          <ActionMarkAsRead id={props.entry.id} pop />
          <ActionOpenEntryAndMarkAsRead entry={props.entry} pop />
          <ActionUnsubscribe feedId={props.entry.feed_id} />
          <ActionDebugJson data={props.entry} />
        </ActionPanel>
      }
    />
  );
}

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { ReactNode, useState } from "react";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { useIcon } from "../utils/useIcon";
import { ActionAiSummary } from "./ActionAiSummary";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionOpenInBrowser } from "./ActionOpenInBrowser";
import { ActionShowEntry } from "./ActionShowEntry";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface EntryListProps {
  isLoading?: boolean;
  navigationTitle?: string;
  entries: Entry[] | undefined;
  mutateEntries?: MutatePromise<
    Entry[] | undefined,
    Entry[] | undefined,
    unknown
  >;
  revalidateEntries?: () => void;
}

const ReadSection = (props: {
  prioritizeUnread: boolean;
  children: ReactNode;
}) =>
  props.prioritizeUnread ? (
    <List.Section title="Read">{props.children}</List.Section>
  ) : (
    <>{props.children}</>
  );

export function EntryList(props: EntryListProps) {
  const { isLoading, unreadEntriesSet, unreadEntries } = useFeedbinApiContext();
  const [prioritizeUnread, setPrioritizeUnread] = useState(true);

  return (
    <List
      navigationTitle={props.navigationTitle}
      searchBarAccessory={
        <List.Dropdown
          defaultValue={prioritizeUnread.toString()}
          storeValue
          tooltip="Option to prioritize unread entries"
          onChange={(value) => setPrioritizeUnread(value === "true")}
        >
          <List.Dropdown.Item title="Prioritize Unread" value="true" />
          <List.Dropdown.Item title="Show All in Order" value="false" />
        </List.Dropdown>
      }
      isLoading={isLoading || props.isLoading}
    >
      {props.entries && props.entries.length === 0 && (
        <List.EmptyView icon={Icon.CheckRosette} title="No content!" />
      )}

      {prioritizeUnread && (
        <>
          <List.Section title="Unread">
            {unreadEntries.data?.length === 0 && (
              <List.Item
                icon={Icon.Tray}
                actions={
                  <ActionPanel>
                    {props.revalidateEntries && (
                      <Action
                        title="Refresh"
                        icon={Icon.RotateClockwise}
                        onAction={() => unreadEntries.revalidate()}
                      />
                    )}
                  </ActionPanel>
                }
                title="No Unread Items"
              />
            )}
            {unreadEntries.data?.map((entry) => (
              <ListItem key={entry.id} entry={entry} isUnread />
            ))}
          </List.Section>
        </>
      )}

      <ReadSection prioritizeUnread={prioritizeUnread}>
        {unreadEntriesSet &&
          props.entries
            ?.filter((entry) =>
              prioritizeUnread ? !unreadEntriesSet.has(entry.id) : true,
            )
            .map((entry) => <ListItem key={entry.id} entry={entry} />)}
      </ReadSection>
    </List>
  );
}

function ListItem(props: { entry: Entry; isUnread?: boolean }) {
  const { subscriptionMap, starredEntriesIdsSet, unreadEntriesSet } =
    useFeedbinApiContext();
  const { entry } = props;
  const icon = useIcon(entry.url);
  return (
    <List.Item
      key={entry.id}
      title={entry.title ?? entry.summary}
      icon={icon}
      keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
      subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
      accessories={[
        starredEntriesIdsSet.has(entry.id) && {
          icon: Icon.Star,
        },
        (unreadEntriesSet.has(entry.id) || props.isUnread) && {
          icon: Icon.Tray,
        },
      ].filter(Boolean)}
      actions={
        <ActionPanel>
          <ActionShowEntry entry={entry} />
          <ActionAiSummary entry={entry} />
          <ActionOpenInBrowser url={entry.url} />
          <ActionCopyUrlToClipboard url={entry.url} />
          <ActionViewSubscription
            feedName={subscriptionMap[entry.feed_id]?.title}
            entry={entry}
          />
          <ActionStarToggle id={entry.id} />
          <ActionMarkAsRead id={entry.id} />
        </ActionPanel>
      }
    />
  );
}

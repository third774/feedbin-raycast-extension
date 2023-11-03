import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { useIcon } from "../utils/useIcon";
import { ActionAiSummary } from "./ActionAiSummary";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionDebugJson } from "./ActionDebugJson";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionOpenInBrowser } from "./ActionOpenInBrowser";
import { ActionShowEntry } from "./ActionShowEntry";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionUnsubscribe } from "./ActionUnsubscribe";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface EntryListProps {
  navigationTitle?: string;
}

export function EntryList(props: EntryListProps) {
  const {
    isLoading,
    unreadEntriesSet,
    unreadEntries,
    entries,
    filterFeedId,
    setFilterFeedId,
    subscriptions,
  } = useFeedbinApiContext();

  return (
    <List
      navigationTitle={props.navigationTitle}
      searchBarAccessory={
        props.navigationTitle ? undefined : (
          <List.Dropdown
            defaultValue={filterFeedId?.toString() ?? "all"}
            tooltip="Option to prioritize unread entries"
            onChange={(value) => {
              setFilterFeedId(value === "all" ? undefined : Number(value));
            }}
          >
            <List.Dropdown.Item title={"All feeds"} value={"all"} />
            {subscriptions.data?.map((subscription) => {
              return (
                <List.Dropdown.Item
                  key={subscription.id}
                  title={subscription.title}
                  keywords={[subscription.title, subscription.site_url]}
                  value={subscription.feed_id.toString()}
                />
              );
            })}
            {/* <List.Dropdown.Item title="Prioritize Unread" value="true" />
          <List.Dropdown.Item title="Show All in Order" value="false" /> */}
          </List.Dropdown>
        )
      }
      isLoading={isLoading}
    >
      {entries.data && entries.data.length === 0 && (
        <List.EmptyView icon={Icon.CheckRosette} title="No content!" />
      )}

      <List.Section title={`Unread (${unreadEntries.data?.length ?? 0})`}>
        {unreadEntries.data?.length === 0 && (
          <List.Item
            icon={Icon.Tray}
            actions={
              <ActionPanel>
                <Action
                  title="Refresh"
                  icon={Icon.RotateClockwise}
                  onAction={() => unreadEntries.revalidate()}
                />
              </ActionPanel>
            }
            title="No Unread Items"
          />
        )}
        {unreadEntries.data?.map((entry) => (
          <ListItem key={entry.id} entry={entry} isUnread />
        ))}
      </List.Section>

      <List.Section title="Read">
        {unreadEntriesSet &&
          entries.data
            ?.filter((entry) => !unreadEntriesSet.has(entry.id))
            .map((entry) => <ListItem key={entry.id} entry={entry} />)}
      </List.Section>
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
          <ActionUnsubscribe feedId={entry.feed_id} />
          <ActionDebugJson data={entry} />
        </ActionPanel>
      }
    />
  );
}

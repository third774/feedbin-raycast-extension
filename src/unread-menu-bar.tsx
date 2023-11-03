import {
  Icon,
  MenuBarExtra,
  getPreferenceValues,
  open,
  openCommandPreferences,
  updateCommandMetadata,
} from "@raycast/api";
import { useEffect } from "react";
import {
  Entry,
  useEntries,
  useSubscriptionMap,
  useUnreadEntriesIds,
} from "./utils/api";

export default function MenuCommand(): JSX.Element {
  const { showCountInMenuBar } = getPreferenceValues();
  const entries = useEntries({ read: "false" });
  const unreadEntriesIds = useUnreadEntriesIds();
  const subscriptionMap = useSubscriptionMap();

  const unreadEntries = entries.data?.filter(
    (entry) => unreadEntriesIds.data?.includes(entry.id),
  );

  useEffect(() => {
    (async () => {
      await updateCommandMetadata({
        subtitle: `${unreadEntries?.length.toString() ?? ""} unread items`,
      });
    })();
  }, []);

  const entriesGroupedByFeedId =
    unreadEntries?.reduce<Record<number, Entry[]>>((acc, entry) => {
      if (acc[entry.feed_id]) {
        acc[entry.feed_id].push(entry);
      } else {
        acc[entry.feed_id] = [entry];
      }
      return acc;
    }, {}) ?? {};

  const groupedEntries = Object.entries(entriesGroupedByFeedId)
    // Sometimes when adding or removing subscriptions
    // the subscriptionMap might not contain the subscription
    // for the entry returned.
    .filter(([key]) => subscriptionMap.data[+key])
    .sort(([aKey], [bKey]) =>
      subscriptionMap.data[+aKey].title.localeCompare(
        subscriptionMap.data[+bKey].title,
      ),
    );

  const unreadCount = unreadEntries ? unreadEntries.length : 0;

  return (
    <MenuBarExtra
      icon={{ source: "feedbin.png" }}
      title={showCountInMenuBar ? unreadCount.toString() : undefined}
      isLoading={
        entries.isLoading ||
        subscriptionMap.isLoading ||
        unreadEntriesIds.isLoading
      }
    >
      {unreadCount === 0 && <MenuBarExtra.Section title="No unread items" />}
      {groupedEntries.map(([feedId, entries]) => {
        return (
          <MenuBarExtra.Section
            key={feedId}
            title={subscriptionMap.data?.[+feedId]?.title ?? "Unknown Feed"}
          >
            {entries.map((entry) => {
              let title = entry.title ?? entry.summary;
              if (title.length > 60) {
                title = title.substring(0, 60) + "...";
              }
              return (
                <MenuBarExtra.Item
                  key={entry.id}
                  title={title}
                  onAction={() => open(entry.url)}
                />
              );
            })}
          </MenuBarExtra.Section>
        );
      })}
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Configure Command"
          icon={Icon.Gear}
          shortcut={{ modifiers: ["cmd"], key: "," }}
          onAction={openCommandPreferences}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

import {
  Action,
  Alert,
  Icon,
  LaunchType,
  clearSearchBar,
  confirmAlert,
  launchCommand,
} from "@raycast/api";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { unsubscribe } from "../utils/api";

export interface ActionUnsubscribeProps {
  feedId: number;
}

export function ActionUnsubscribe(props: ActionUnsubscribeProps) {
  const { subscriptions } = useFeedbinApiContext();

  const subscription = subscriptions.data?.find(
    (s) => s.feed_id === props.feedId,
  );

  if (!subscription) return null;

  // Don't allow unsubscribing from Pages feeds
  if (subscription.site_url === "http://pages.feedbinusercontent.com") {
    return null;
  }

  return (
    <Action
      title="Unsubscribe"
      icon={Icon.MinusCircle}
      style={Action.Style.Destructive}
      shortcut={{
        key: "x",
        modifiers: ["ctrl"],
      }}
      onAction={async () => {
        if (
          await confirmAlert({
            title: `Are you sure?`,
            message: subscription.feed_url,
            icon: Icon.ExclamationMark,
            primaryAction: {
              title: "Unsubscribe",
              style: Alert.ActionStyle.Destructive,
            },
          })
        ) {
          await subscriptions.mutate(unsubscribe(subscription.id), {
            optimisticUpdate: (subs) =>
              subs?.filter((sub) => sub.id !== subscription.id),
          });
          launchCommand({
            name: "unread-menu-bar",
            type: LaunchType.Background,
          });
          clearSearchBar();
        }
      }}
    />
  );
}

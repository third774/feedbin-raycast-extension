import {
  Action,
  Icon,
  LaunchType,
  launchCommand,
  useNavigation,
} from "@raycast/api";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Entry, markAsRead } from "../utils/api";

export interface ActionOpenEntryAndMarkAsReadProps {
  entry: Entry;
  pop?: boolean;
}

export function ActionOpenEntryAndMarkAsRead(
  props: ActionOpenEntryAndMarkAsReadProps,
) {
  const { unreadEntriesSet, unreadEntries } = useFeedbinApiContext();
  const { pop } = useNavigation();
  if (!unreadEntriesSet.has(props.entry.id)) return null;
  return (
    <Action.OpenInBrowser
      title="Open and Mark as Read"
      icon={Icon.CheckCircle}
      url={props.entry.url}
      shortcut={{
        key: "o",
        modifiers: ["cmd", "shift"],
      }}
      onOpen={async () => {
        await unreadEntries.mutate(markAsRead(props.entry.id), {
          optimisticUpdate: (entries) =>
            entries?.filter((e) => e.id !== props.entry.id),
        });
        await launchCommand({
          name: "unread-menu-bar",
          type: LaunchType.Background,
        });
        if (props.pop) {
          pop();
        }
      }}
    />
  );
}

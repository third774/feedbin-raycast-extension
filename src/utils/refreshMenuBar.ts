import { launchCommand, LaunchType } from "@raycast/api";

export function refreshMenuBar() {
  return launchCommand({
    name: "unread-menu-bar",
    type: LaunchType.Background,
  });
}

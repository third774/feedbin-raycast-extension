import {
  closeMainWindow,
  getSelectedText,
  showToast,
  Toast,
} from "@raycast/api";
import { getEntries, markAsRead } from "./utils/api";
import { isValidURL } from "./utils/isValidURL";
import { refreshMenuBar } from "./utils/refreshMenuBar";

export default async function Main() {
  showToast(Toast.Style.Animated, "Looking for selected URL...");
  const entriesPromise = getEntries({
    read: false,
  });
  const selection = await getSelectedText();
  if (!isValidURL(selection)) {
    return showToast(Toast.Style.Failure, "Please select a valid URL");
  }
  const entries = await entriesPromise;

  const entry = entries.find((entry) => entry.url === selection);

  if (!entry) {
    return showToast(Toast.Style.Failure, "Unread entry not found for URL");
  }

  closeMainWindow();
  showToast(Toast.Style.Animated, "Marking as read...");

  try {
    await markAsRead(entry.id);
    await showToast(Toast.Style.Success, `Marked ${selection} as read`);
    await refreshMenuBar();
  } catch (error) {
    await showToast(Toast.Style.Failure, "Failed to mark as read");
  }
}

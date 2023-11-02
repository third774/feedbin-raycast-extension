import { Action, Icon } from "@raycast/api";
import { FeedbinApiContextProvider } from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { EntryContent } from "./EntryContent";

export interface ActionShowEntryProps {
  entry: Entry;
}

export function ActionShowEntry(props: ActionShowEntryProps) {
  return (
    <Action.Push
      title="View in Raycast"
      icon={Icon.RaycastLogoNeg}
      target={
        <FeedbinApiContextProvider>
          <EntryContent entry={props.entry} />
        </FeedbinApiContextProvider>
      }
    />
  );
}

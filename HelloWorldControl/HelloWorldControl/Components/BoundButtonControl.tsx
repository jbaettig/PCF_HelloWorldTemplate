import * as React from "react";
import { PrimaryButton, Stack, Text, TextField } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface BoundButtonControlProps {}

export const BoundButtonControl = observer((props: BoundButtonControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");
  const [input, setInput] = React.useState<string>(vm.boundValue);
  const debounceTimer = React.useRef<number | undefined>(undefined);

  return (
    <>
      <Stack horizontal={false} verticalAlign={"center"} style={{ width: "100%", padding: "10px" }}>
        <Stack.Item>
          <Text variant={"medium"} block>
            Input Bound Value:
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TextField
            value={input}
            onChange={(e, newValue) => {
              const val = newValue ?? "";
              setInput(val);

              window.clearTimeout(debounceTimer.current);
              debounceTimer.current = window.setTimeout(() => {
                vm.set("boundValue", val);
                vm.refresh?.();
              }, 300);
            }}
            onBlur={() => {
              window.clearTimeout(debounceTimer.current);
              vm.set("boundValue", input);
              vm.refresh?.();
            }}
            placeholder="Enter text"
            styles={{ root: { width: "100%" } }}
          />
        </Stack.Item>
        <Stack.Item>
          <PrimaryButton
            text="Alert bound value"
            onClick={() => {
              window.alert(`Bound value: ${vm.boundValue}`);
            }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant={"medium"} block style={{ textAlign: "center", marginTop: "10px" }}>
            Current bound value: {vm.boundValue}
          </Text>
        </Stack.Item>
      </Stack>
    </>
  );
});

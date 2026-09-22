import * as React from "react";
import { Icon, Stack, Text, TextField, useTheme } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface FieldControlProps {}

export const FieldControl = observer((props: FieldControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");
  const theme = useTheme();

  const [input, setInput] = React.useState(vm.inputValue);
  const debounceTimer = React.useRef<number | undefined>(undefined);

  return (
    <>
      <Stack
        tokens={{ childrenGap: 10 }}
        styles={{
          root: {
            width: "100%",
            boxSizing: "border-box",
            padding: 16,
            background: theme.semanticColors.bodyStandoutBackground,
            border: `1px solid ${theme.semanticColors.variantBorder}`,
            borderRadius: 6,
          },
        }}
      >
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName="Edit" styles={{ root: { color: theme.palette.themePrimary } }} />
          <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
            Input static value
          </Text>
        </Stack>
        <Stack.Item>
          <TextField
            value={input}
            onChange={(e, newValue) => {
              const val = newValue ?? "";
              setInput(val);

              window.clearTimeout(debounceTimer.current);
              debounceTimer.current = window.setTimeout(() => {
                vm.set("inputValue", val);
                vm.refresh?.();
              }, 300);
            }}
            onBlur={() => {
              window.clearTimeout(debounceTimer.current);
              vm.set("inputValue", input);
              vm.refresh?.();
            }}
            placeholder="Enter text"
            ariaLabel="Input static value"
            styles={{ root: { width: "100%" } }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant="small" styles={{ root: { color: theme.semanticColors.bodySubtext } }}>
            Current value: {vm.inputValue || "Not set"}
          </Text>
        </Stack.Item>
      </Stack>
    </>
  );
});

import React = require("react");
import { Stack, Text, useTheme } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface ListControlProps {}

export const ListControl = observer((props: ListControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");
  const theme = useTheme();

  return (
    <>
      {vm.displayValues.length > 0 && (
        <Stack tokens={{ childrenGap: 6 }}>
          {vm.displayValues.map((displayVal, index) => {
            return (
              <Stack
                key={index}
                horizontal
                verticalAlign="center"
                styles={{
                  root: {
                    padding: "10px 12px",
                    background: theme.semanticColors.listBackground,
                    border: `1px solid ${theme.semanticColors.variantBorder}`,
                    borderRadius: 4,
                  },
                }}
              >
                <Text variant="medium">{displayVal}</Text>
              </Stack>
            );
          })}
        </Stack>
      )}
    </>
  );
});

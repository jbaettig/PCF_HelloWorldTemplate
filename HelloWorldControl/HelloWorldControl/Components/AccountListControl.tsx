import React = require("react");
import { Icon, Stack, Text, useTheme } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface AccountListControlProps {}

export const AccountListControl = observer((props: AccountListControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");
  const theme = useTheme();

  return (
    <>
      {vm.displayValues.length > 0 && (
        <Stack tokens={{ childrenGap: 6 }}>
          {vm.displayValues.map((record) => {
            return (
              <Stack
                key={record.id}
                horizontal
                verticalAlign="center"
                role="button"
                tabIndex={0}
                onClick={() => vm.openRecord?.("account", record.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    vm.openRecord?.("account", record.id);
                  }
                }}
                styles={{
                  root: {
                    padding: "10px 12px",
                    background: theme.semanticColors.listBackground,
                    border: `1px solid ${theme.semanticColors.variantBorder}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    selectors: {
                      ":hover": { background: theme.semanticColors.listItemBackgroundHovered },
                      ":focus": { outline: `2px solid ${theme.palette.themePrimary}`, outlineOffset: "1px" },
                    },
                  },
                }}
              >
                <Text variant="medium">{record.name}</Text>
                <Icon
                  iconName="ChevronRight"
                  styles={{ root: { marginLeft: "auto", color: theme.semanticColors.bodySubtext } }}
                />
              </Stack>
            );
          })}
        </Stack>
      )}
    </>
  );
});

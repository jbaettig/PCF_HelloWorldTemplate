import React = require("react");
import {
  Icon,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
  Theme,
  ThemeProvider,
  useTheme,
} from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProvider, ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";
import { FieldControl } from "./FieldControl";
import { BoundButtonControl } from "./BoundButtonControl";
import { ListControl } from "./ListControl";

export interface StartingTemplateControlMainProps {
  serviceProvider: ServiceProvider;
  theme?: Theme;
}

export const StartingTemplateControlMain = observer((props: StartingTemplateControlMainProps): React.JSX.Element => {
  const vm = props.serviceProvider.get<ViewModel>("vm");

  return (
    <>
      <ThemeProvider theme={props.theme}>
        <MainContent serviceProvider={props.serviceProvider} viewModel={vm} />
      </ThemeProvider>
    </>
  );
});

interface MainContentProps {
  serviceProvider: ServiceProvider;
  viewModel: ViewModel;
}

const MainContent = ({ serviceProvider, viewModel }: MainContentProps): React.JSX.Element => {
  const theme = useTheme();

  return (
    <ServiceProviderContext.Provider value={serviceProvider}>
      <Stack
        tokens={{ childrenGap: 16 }}
        styles={{
          root: {
            width: "100%",
            boxSizing: "border-box",
            padding: 20,
            background: theme.semanticColors.bodyBackground,
            color: theme.semanticColors.bodyText,
          },
        }}
      >
        <Stack
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              padding: "4px 0 8px",
              borderBottom: `1px solid ${theme.semanticColors.variantBorder}`,
            },
          }}
        >
          <Icon iconName="Home" styles={{ root: { fontSize: 26, color: theme.palette.themePrimary } }} />
          <Stack tokens={{ childrenGap: 2 }}>
            <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: theme.semanticColors.bodyText } }}>
              Hello World control
            </Text>
            <Text variant="small" styles={{ root: { color: theme.semanticColors.bodySubtext } }}>
              Edit values and preview the connected data.
            </Text>
          </Stack>
        </Stack>
        <FieldControl />
        <BoundButtonControl />
        {viewModel.loading && (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
            <Spinner size={SpinnerSize.small} label="Loading accounts..." />
          </MessageBar>
        )}
        {viewModel.displayValues.length > 0 && (
          <Stack tokens={{ childrenGap: 10 }}>
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
              <Icon iconName="ContactList" styles={{ root: { color: theme.palette.themePrimary } }} />
              <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
                Loaded accounts
              </Text>
            </Stack>
            <ListControl />
          </Stack>
        )}
      </Stack>
    </ServiceProviderContext.Provider>
  );
};

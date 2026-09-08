import React = require("react");
import { Stack, Text, TextField } from "@fluentui/react";

export const StartingTemplateControlMain = (): React.JSX.Element => {
  return (
    <>
      <Stack horizontal={false} verticalAlign={"center"} style={{ width: "100%" }}>
        <Stack.Item>
          <Text variant={"xLarge"} block style={{ textAlign: "center" }}>
            Welcome to PCF Hello World
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Text variant={"medium"} block style={{ textAlign: "center" }}>
            Environment check: Module 0 baseline
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TextField value="Environment check: Module 0 baseline" />
        </Stack.Item>
      </Stack>
    </>
  );
};

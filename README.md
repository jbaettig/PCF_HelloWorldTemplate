# From Scratch to Solid — PCF Example

Supporting code for my **South Coast Summit 2025** session:  
**"From Scratch to Solid: A Reusable Framework for PCF Components"**  

Updated for **Nordic Summit 2026**, with the same core session content plus a new Copilot **skill** (`pcf-standards`) that captures the architecture as reusable AI guidance.

---

## 📍 Workshop Checkpoint: Module 0 — Environment Baseline

**Status:** ✅ Environment check setup  
**What's included:**
- Basic Fluent UI greeting component
- Minimal PCF control wiring
- No ViewModel, ServiceProvider, or data loading yet
- Perfect for verifying build environment and dependencies

## What to do now?

In this exercise, you will replace the Module 0 static environment check with an interactive Fluent UI field. The goal is to learn **component-based architecture** and React's `useState` hook. Keep the value inside the component for now: do not add MobX, a ViewModel, services, PCF outputs, or Dataverse calls.

### 1. Create a field component

Create `HelloWorldControl/HelloWorldControl/Components/FieldControl.tsx`.

Add this code:

```tsx
import * as React from "react";
import { Stack, Text, TextField } from "@fluentui/react";

export interface FieldControlProps {}

export const FieldControl = (props: FieldControlProps): React.JSX.Element => {
  const [inputValue, setInputValue] = React.useState<string>("");

  return (
    <>
      <Stack horizontal={false} verticalAlign={"center"} style={{ width: "100%", padding: "10px" }}>
        <Stack.Item>
          <Text variant={"medium"} block>
            Input Field:
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TextField
            value={inputValue}
            onChange={(event, newValue) => setInputValue(newValue || "")}
            placeholder="Enter text here"
            styles={{ root: { width: "100%" } }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant={"medium"} block style={{ textAlign: "center", marginTop: "10px" }}>
            Current value: {inputValue}
          </Text>
        </Stack.Item>
      </Stack>
    </>
  );
};
```

### 2. Understand the state line

Focus on this line:

```tsx
const [inputValue, setInputValue] = React.useState<string>("");
```

- `inputValue` is the value React remembers for this component.
- `setInputValue` changes that value and tells React to draw the component again.
- `""` is the initial value, so the field starts empty.

When a participant types in the field, `onChange` receives the new text and calls `setInputValue`. React re-renders the component, so the value after **Current value:** updates immediately.

```text
User types -> onChange runs -> setInputValue(newValue)
           -> React re-renders -> the UI shows inputValue
```

`value={inputValue}` makes this a **controlled component**: React state is the single source of truth for what the field displays.

### 3. Render the field component

Open `HelloWorldControl/HelloWorldControl/Components/StartingTemplateControlMain.tsx`.

1. Change the Fluent UI import to remove `TextField`:

   ```tsx
   import { Stack, Text } from "@fluentui/react";
   ```

2. Add the component import:

   ```tsx
   import { FieldControl } from "./FieldControl";
   ```

3. Remove the existing `TextField` containing `Environment check: Module 0 baseline`.

4. Replace the static environment-check `<Text>` element with:

   ```tsx
   <FieldControl />
   ```

The main component should retain the welcome heading and render `FieldControl` beneath it.

### 4. Build and run

From the `HelloWorldControl` directory, run:

```bash
npm install
npm run build
npm start
```

In the PCF test harness, enter text in the field. The text after **Current value:** should update as you type.

### 5. Check your work

You are ready for Module 2 when all of the following are true:

- `FieldControl.tsx` contains a Fluent UI `TextField` and `React.useState`.
- The text field uses `value={inputValue}`.
- Its `onChange` calls `setInputValue`.
- `StartingTemplateControlMain` renders `<FieldControl />`.
- There are no changes to `ControlManifest.Input.xml`, `index.ts`, package dependencies, PCF outputs, MobX, or Dataverse services.

Compare your completed exercise with the supplied checkpoint:

```bash
git diff module-1-done
```

**Next:** Move to `module-1-done` when you are ready to check your solution.

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js 18+  
- Power Platform CLI (`pac`) installed  
- A Dataverse environment (not required for this module)

### Build & Test the PCF Control  
Confirm you are in the PCF Control directory (HelloWorldControl)
```bash
npm install
npm run build
pac pcf push
```

---

## 📚 Resources  

- [Power Platform CLI docs](https://learn.microsoft.com/power-platform/developer/cli/introduction)  
- [Fluent UI](https://developer.microsoft.com/fluentui)  
- [MobX](https://mobx.js.org/)  

---

## 🙌 Credits  

Built for **South Coast Summit 2025**.  
Updated for **Nordic Summit 2026**.  
Thanks to Carl Cookson for the always incredible assistance!

# From Scratch to Solid — PCF Example

Supporting code for my **South Coast Summit 2025** session:  
**"From Scratch to Solid: A Reusable Framework for PCF Components"**  

Updated for **Nordic Summit 2026**, with the same core session content plus a new Copilot **skill** (`pcf-standards`) that captures the architecture as reusable AI guidance.

---

## 📍 Workshop Checkpoint: Module 2 — ViewModel + MobX + ServiceProvider

**Status:** ✅ Centralized state management  
**What's included:**
- ViewModel class with MobX observables (`inputValue`)
- ServiceProvider for dependency injection and service registration
- ServiceProviderContext for passing services to components
- Observer pattern with `mobx-react-lite`
- FieldControl now gets state from ViewModel via context
- Foundation for scalable, testable architecture

**Key Concepts:**
- Separation of state from component logic
- MobX actions and observables
- Service registry pattern
- React Context API integration

## What to do now?

**Timebox:** 25 minutes  
**Learning goal:** Turn the existing text input into a PCF output so the component can send values back to the hosting form. This module introduces output binding, `notifyOutputChanged()`, `getOutputs()`, and a second UI action that updates the same output through the shared ViewModel.

### Concepts introduced in this module

- **Output binding:** A PCF control can return values to Power Apps through properties marked as `bound` or `output` in the manifest. This is needed now so text entered in the component can update `boundField` on the form.
- **`notifyOutputChanged()`:** PCF does not continuously pull values from your control. Calling this framework callback tells Power Apps that `getOutputs()` should be called because the component has a new value.
- **`getOutputs()`:** This lifecycle method maps your internal state back to manifest property names. In this module, `inputValue` becomes the value returned for `boundField`.
- **Shared ViewModel coordination:** Both the text field and the new button update the same observable ViewModel state, so different components can coordinate without passing state through props.

### Files to change

- Create `HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx`
- Edit `HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx`
- Edit `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`
- Edit `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`
- Edit `HelloWorldControl\HelloWorldControl\index.ts`
- Remove nothing in this module.

### 1. Extend the ViewModel for framework refresh

Open `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`.

Add a `boundValue` field and a `refresh` callback, initialize both in the constructor, and register `boundValue` as observable:

```ts
import { action, makeObservable, observable } from "mobx";

export class ViewModel {
  inputValue: string;
  boundValue: string; //Define the boundvalue field
  refresh: () => void;

  constructor() {
    this.inputValue = "";
    this.boundValue = ""; // initialise the value
    this.refresh = () => {}; // add teh callback

    makeObservable(this, {
      inputValue: observable,
      boundValue: observable, // ensure you make the new field observable
      set: action,
    });
  }

  set<K extends keyof this>(key: K, value: this[K]) {
    (this[key] as this[K]) = value;
  }
}
```

`refresh` starts as an empty function because the ViewModel is framework-agnostic. The PCF control will assign the real framework callback during initialization.

### 2. Wire the PCF lifecycle to the ViewModel

Open `HelloWorldControl\HelloWorldControl\index.ts`.

In `init`, immediately after creating the ViewModel, assign `refresh` so ViewModel-driven UI changes can notify the framework:
This simple change calls the PCF wrapper to update the underlying field(s) when updating the viewmodel.

```ts
this.viewModel = new ViewModel();
this.viewModel.refresh = () => {
  notifyOutputChanged();
};
this.serviceProvider = new ServiceProvider();
```

In `updateView`, store the incoming bound field value in `boundValue`:

```ts
const vm = this.viewModel;
vm.set("boundValue", context.parameters.boundField?.raw ?? "");
```

This keeps the value received from the host form separate from the value the component is preparing to output, allowing for a "previous and current" state.

Update `getOutputs()` so Power Apps receives the current ViewModel input value as the manifest output property:

```ts
public getOutputs(): IOutputs {
  return {
    boundField: this.viewModel.inputValue,
  };
}
```

### 3. Notify the framework when the text field changes

Open `HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx`.

Update the label, change handler, placeholder, and display text in the existing `TextField` section:

```tsx
<Text variant={"medium"} block>
  Input Field (updates output):
</Text>
```

```tsx
<TextField
  value={vm.inputValue}
  onChange={(event, newValue) => {
    vm.set("inputValue", newValue || "");
    vm.refresh();
  }}
  placeholder="Enter text - this will be output to boundField"
  styles={{ root: { width: "100%" } }}
/>
```

```tsx
<Text variant={"medium"} block style={{ textAlign: "center", marginTop: "10px" }}>
  Current input: {vm.inputValue}
</Text>
```

The important change is calling `vm.refresh()` after updating `inputValue`. Without that call, the ViewModel would change, but the PCF framework would not know it should ask for new outputs.

### 4. Add a button that updates the same output

Create `HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx` with the following code:

```tsx
import * as React from "react";
import { PrimaryButton } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface BoundButtonControlProps {}

export const BoundButtonControl = observer((props: BoundButtonControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");

  const handleClick = () => {
    const timestamp = new Date().toLocaleTimeString();
    vm.set("inputValue", `Updated at ${timestamp}`);
    vm.refresh();
  };

  return (
    <>
      <PrimaryButton onClick={handleClick} text="Update Output Field" />
    </>
  );
});
```

This component uses the same ServiceProvider and ViewModel as `FieldControl`. Clicking the button sets a timestamp message and then notifies PCF that the output has changed.

### 5. Render the new button

Open `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`.

Add this import with the other component imports:

```tsx
import { BoundButtonControl } from "./BoundButtonControl";
```

Render the button directly after `FieldControl`:

```tsx
<Stack.Item>
  <FieldControl />
</Stack.Item>
<Stack.Item>
  <BoundButtonControl />
</Stack.Item>
```

### 6. Build and test

From the PCF project folder:

```powershell
npm run build
npm run start
pac pcf push
```

Use `pac pcf push` when you are ready to test the control in Power Apps. In the running control, type into the field and click **Update Output Field**. Both actions should update the value returned for `boundField`.

### Completion checklist

- `BoundButtonControl.tsx` exists and uses the existing ServiceProvider to retrieve `vm`.
- `ViewModel` has `inputValue`, `boundValue`, and `refresh`.
- `init` assigns `this.viewModel.refresh` to call `notifyOutputChanged()`.
- `updateView` reads `context.parameters.boundField?.raw` into `boundValue`.
- `FieldControl` updates `inputValue` and calls `vm.refresh()` when the text changes.
- `getOutputs()` returns `{ boundField: this.viewModel.inputValue }`.
- `npm run build` and `npm run lint` complete successfully.

To compare your result with the completed checkpoint, run this from the repository root:

```powershell
git diff --stat module-3-done -- HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx HelloWorldControl\HelloWorldControl\Models\ViewModel.ts HelloWorldControl\HelloWorldControl\index.ts
```

No output means your module files match `module-3-done`. You will more than likely have some discrepencies as you are only human!

**Next preview:** Module 4 introduces Dataverse integration and async data loading, keeping all Dataverse communication behind the project service boundary.

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js 18+  
- Power Platform CLI (`pac`) installed  

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
- [React Context API](https://react.dev/reference/react/createContext)

---

## 🙌 Credits  

Built for **South Coast Summit 2025**.  
Updated for **Nordic Summit 2026**.  
Thanks to Carl Cookson for the always incredible assistance!

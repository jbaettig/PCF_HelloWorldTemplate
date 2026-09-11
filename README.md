# From Scratch to Solid — PCF Example

Supporting code for my **South Coast Summit 2025** session:  
**"From Scratch to Solid: A Reusable Framework for PCF Components"**  

Updated for **Nordic Summit 2026**, with the same core session content plus a new Copilot **skill** (`pcf-standards`) that captures the architecture as reusable AI guidance.

---

## 📍 Workshop Checkpoint: Module 1 — React Fundamentals with useState

**Status:** ✅ Local React state  
**What's included:**
- FieldControl with React `useState` hook for local state
- TextField input component from Fluent UI
- Real-time value display and updates
- No ViewModel, ServiceProvider, or MobX yet
- Foundation for learning React state management patterns

## What to do now?

**Timebox:** About 30 minutes  
**Learning goal:** Move the field value out of component-local React state and into a central ViewModel that is shared through a control-scoped ServiceProvider.

In this module you will introduce the architecture that the rest of the workshop builds on:

- **ViewModel:** a class that owns the control's shared state, so React components do not become the long-term source of truth.
- **MobX observable state:** state that React can automatically re-render when it changes.
- **MobX actions:** named or centralized methods that update observable state in a predictable way.
- **ServiceProvider:** a small registry for shared control services and state.
- **React Context:** the React mechanism used to make the ServiceProvider available to components without passing it through every prop.
- **`observer`:** the `mobx-react-lite` wrapper that lets React components re-render when MobX observables they read change.

### Files to change

Create:

- `HelloWorldControl\HelloWorldControl\Models\ServiceProvider.ts`
- `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`

Edit:

- `HelloWorldControl\HelloWorldControl\index.ts`
- `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`
- `HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx`

Remove:

- Nothing in this module.

### Step 1 — Create the ServiceProvider

Create `HelloWorldControl\HelloWorldControl\Models\ServiceProvider.ts`:

```ts
import React = require("react");

export class ServiceProvider {
  private services = new Map();
  get<T>(serviceName: string): T {
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName) as T;
    } else throw new Error(`Service '${serviceName} not registered in ServiceProvider`);
  }
  register<T>(serviceName: string, service: T): void {
    this.services.set(serviceName, service);
  }
}

export const ServiceProviderContext = React.createContext<ServiceProvider>(new ServiceProvider());
```

The ServiceProvider gives the control one place to register shared objects. For now it only stores the ViewModel, but later modules can add services without changing every component constructor or prop chain.

The `ServiceProviderContext` is a React Context. It lets child components ask React for the current ServiceProvider instead of receiving it through several layers of props.

### Step 2 — Create the ViewModel

Create `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`:

```ts
import { action, makeObservable, observable } from "mobx";

export class ViewModel {
  inputValue: string;

  constructor() {
    this.inputValue = "";

    makeObservable(this, {
      inputValue: observable,
      set: action,
    });
  }

  set<K extends keyof this>(key: K, value: this[K]) {
    (this[key] as this[K]) = value;
  }
}
```

The ViewModel is now the authoritative place for the input value. `inputValue` is marked as `observable`, which means MobX can track components that read it. The `set` method is marked as an `action`, which keeps state changes explicit and easy to find.

### Step 3 — Register the ViewModel in the PCF control

Edit `HelloWorldControl\HelloWorldControl\index.ts`.

Add these imports near the top:

```ts
import { ServiceProvider } from "./Models/ServiceProvider";
import { ViewModel } from "./Models/ViewModel";
```

Add these fields to the `HelloWorldControl` class:

```ts
serviceProvider: ServiceProvider;
viewModel: ViewModel;
```

In `init`, create the ViewModel and ServiceProvider, then register the ViewModel under the key `"vm"`:

```ts
this.viewModel = new ViewModel();
this.serviceProvider = new ServiceProvider();
this.serviceProvider.register("vm", this.viewModel);
```

In `updateView`, copy the current PCF input value into the ViewModel and pass the ServiceProvider into the React component:

```ts
const vm = this.viewModel;
vm.set("inputValue", context.parameters.inputField?.raw ?? "");

const reactRoot = createRoot(this._container);
reactRoot.render(React.createElement(StartingTemplateControlMain, { serviceProvider: this.serviceProvider }));
```

This keeps the PCF lifecycle responsible for framework inputs and keeps React focused on rendering and user interaction.

### Step 4 — Provide the ServiceProvider to React components

Edit `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`.

Add these imports:

```tsx
import { observer } from "mobx-react-lite";
import { ServiceProvider, ServiceProviderContext } from "../Models/ServiceProvider";
```

Add props for the ServiceProvider:

```tsx
export interface StartingTemplateControlMainProps {
  serviceProvider: ServiceProvider;
}
```

Update the component so it is wrapped with `observer` and provides the ServiceProvider through React Context:

```tsx
export const StartingTemplateControlMain = observer((props: StartingTemplateControlMainProps): React.JSX.Element => {
  return (
    <>
      <ServiceProviderContext.Provider value={props.serviceProvider}>
        <Stack horizontal={false} verticalAlign={"center"} style={{ width: "100%" }}>
          <Stack.Item>
            <Text variant={"xLarge"} block style={{ textAlign: "center" }}>
              Welcome to PCF Hello World
            </Text>
          </Stack.Item>
          <Stack.Item>
            <FieldControl />
          </Stack.Item>
        </Stack>
      </ServiceProviderContext.Provider>
    </>
  );
});
```

The provider makes the same ServiceProvider instance available to everything inside the component tree. `observer` prepares the component to respond to MobX observable changes.

### Step 5 — Read and update state from FieldControl

Edit `HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx`.

Add these imports:

```tsx
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";
```

Replace the local `useState` value with the ViewModel from the ServiceProvider:

```tsx
export const FieldControl = observer((props: FieldControlProps): React.JSX.Element => {
  const serviceProvider = React.useContext(ServiceProviderContext);
  const vm = serviceProvider.get<ViewModel>("vm");

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
            value={vm.inputValue}
            onChange={(event, newValue) => vm.set("inputValue", newValue || "")}
            placeholder="Enter text here"
            styles={{ root: { width: "100%" } }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant={"medium"} block style={{ textAlign: "center", marginTop: "10px" }}>
            Current value: {vm.inputValue}
          </Text>
        </Stack.Item>
      </Stack>
    </>
  );
});
```

`FieldControl` no longer owns the committed value with `useState`. It reads `vm.inputValue` and updates it through the ViewModel action. Because the component is wrapped in `observer`, the displayed value updates when the observable changes.

### Step 6 — Build and test

From the PCF project folder:

```bash
cd HelloWorldControl
npm install
npm run build
npm run lint
pac pcf push
```

Use `npm run build` to verify the TypeScript and PCF bundle compile. Use `npm run lint` to catch style and quality issues. Use `pac pcf push` when you are ready to deploy the control to your development environment.

### Completion checklist

- `ServiceProvider.ts` exists and exports both `ServiceProvider` and `ServiceProviderContext`.
- `ViewModel.ts` exists and exposes observable `inputValue`.
- `index.ts` creates one ViewModel and one ServiceProvider for the control instance.
- The ViewModel is registered with the ServiceProvider using the key `"vm"`.
- `StartingTemplateControlMain` receives the ServiceProvider and wraps its children in `ServiceProviderContext.Provider`.
- `FieldControl` reads the ViewModel from context instead of using local `useState`.
- The text field and "Current value" display still update as you type.
- `npm run build` completes successfully.

To compare your result with the completed checkpoint:

```bash
git fetch origin module-2-done
git diff --name-status origin/module-2-done -- HelloWorldControl\HelloWorldControl\Models\ServiceProvider.ts HelloWorldControl\HelloWorldControl\Models\ViewModel.ts HelloWorldControl\HelloWorldControl\index.ts HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx HelloWorldControl\HelloWorldControl\Components\FieldControl.tsx
```

The next module introduces output binding and framework interaction, so the value can move beyond internal UI state and participate in the PCF control lifecycle.

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
- [React Hooks](https://react.dev/reference/react/hooks)  

---

## 🙌 Credits  

Built for **South Coast Summit 2025**.  
Updated for **Nordic Summit 2026**.  
Thanks to Carl Cookson for the always incredible assistance!

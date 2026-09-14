# From Scratch to Solid — PCF Example

Supporting code for my **South Coast Summit 2025** session:  
**"From Scratch to Solid: A Reusable Framework for PCF Components"**

Updated for **Nordic Summit 2026**, with the same core session content plus a new Copilot **skill** (`pcf-standards`) that captures the architecture as reusable AI guidance.

---

## 📍 Workshop Checkpoint: Module 3 — Output Binding & Framework Interaction

**Status:** ✅ Output properties and two-way interaction  
**What's included:**

- ViewModel with `refresh()` callback for notifying framework of output changes
- FieldControl that calls `vm.refresh()` on input changes
- BoundButtonControl demonstrating button-triggered updates
- `getOutputs()` returns `inputValue` as `boundField` output
- Bound field synchronization pattern

**Key Concepts:**

- Two-way binding between PCF and form
- Framework notification via `notifyOutputChanged()`
- Output parameter mapping
- Component coordination through shared ViewModel

## What to do now?

**Timebox:** About 30 minutes  
**Learning goal:** Isolate Dataverse Web API communication inside a dedicated `DataverseService` class, register it with the `ServiceProvider`, and coordinate asynchronous data loading and rendering through the central `ViewModel`.

In this module, you will introduce service boundary isolation and asynchronous data integration:

- **Service Boundary Isolation (`DataverseService`):** Keeping Web API and Dataverse communication out of React components and PCF lifecycle code so data retrieval is isolated, testable, and reusable.
- **Service Registration:** Registering `DataverseService` under key `"dv"` in the `ServiceProvider` alongside `"vm"`.
- **Async Loading State Management:** Managing `loading` and `displayValues` in the `ViewModel` so components can render loading indicators, error fallback, and loaded items reactively.
- **Rendering Asynchronous Data (`ListControl`):** Using an `observer` component to map loaded Dataverse records into Fluent UI components.
- **Debounced Local State Pattern:** Using component-local `useState` and `useRef` timers for smooth text field editing prior to updating observable `ViewModel` state.

---

### Files to change

Create:

- `HelloWorldControl\HelloWorldControl\Models\DataverseService.ts`
- `HelloWorldControl\HelloWorldControl\Components\ListControl.tsx`

Edit:

- `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`
- `HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx`
- `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`
- `HelloWorldControl\HelloWorldControl\index.ts`

Remove:

- Nothing in this module.

---

### Step 1 — Create the DataverseService

Utilising our SOLID Principles, we think about the Single remit again, making a service for any interaction with dataverse rather than including in the PCF render or view model.

> [!NOTE]
> BIG assumption you have accounts. Feel free to update to another table if you dont.

Create `HelloWorldControl\HelloWorldControl\Models\DataverseService.ts`:

```ts
import { IInputs } from "../generated/ManifestTypes";

export interface AccountSummary {
  name?: string;
}

export class DataverseService {
  webApi: ComponentFramework.WebApi;
  context: ComponentFramework.Context<IInputs>;

  constructor(
    webApi: ComponentFramework.WebApi,
    context: ComponentFramework.Context<IInputs>,
  ) {
    this.webApi = webApi;
    this.context = context;
  }

  loadData(): Promise<AccountSummary[]> {
    return this.webApi
      .retrieveMultipleRecords("account", "?$select=name&$top=5")
      .then((response) => (response?.entities ?? []) as AccountSummary[]);
  }
}
```

**Why is this needed now?**  
React components and control lifecycle methods should not execute raw Web API calls directly or parse API payloads. Putting `retrieveMultipleRecords` inside `DataverseService` isolates Dataverse query construction and response mapping in one dedicated location, making maintainability easier.

---

### Step 2 — Extend the ViewModel with Async State

Edit `HelloWorldControl\HelloWorldControl\Models\ViewModel.ts`.

Add `displayValues: string[]` and `loading: boolean` to track the list of retrieved record names and whether an asynchronous request is in progress. Make `refresh` optional (`refresh?: () => void;`).

```ts
import { action, makeObservable, observable } from "mobx";

export class ViewModel {
  inputValue: string;
  boundValue: string;
  displayValues: string[];
  loading: boolean;

  refresh?: () => void;

  constructor() {
    this.inputValue = "";
    this.boundValue = "";
    this.displayValues = [];
    this.loading = false;

    makeObservable(this, {
      inputValue: observable,
      boundValue: observable,
      displayValues: observable,
      loading: observable,
      set: action,
    });
  }

  set<K extends keyof this>(key: K, value: this[K]) {
    (this[key] as this[K]) = value;
  }
}
```

**Why is this needed now?**  
The ViewModel is the single source of truth for UI state. Adding `loading` and `displayValues` as MobX observables allows any React component wrapped in `observer` to re-render automatically when data starts or finishes loading.

---

### Step 3 — Create the ListControl Component

Create `HelloWorldControl\HelloWorldControl\Components\ListControl.tsx`:

```tsx
import React = require("react");
import { Text } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface ListControlProps {}

export const ListControl = observer(
  (props: ListControlProps): React.JSX.Element => {
    const serviceProvider = React.useContext(ServiceProviderContext);
    const vm = serviceProvider.get<ViewModel>("vm");

    return (
      <>
        {vm.displayValues.length > 0 && (
          <>
            {vm.displayValues.map((displayVal, index) => {
              return (
                <Text
                  variant={"medium"}
                  block
                  style={{ textAlign: "center" }}
                  key={index}
                >
                  {displayVal}
                </Text>
              );
            })}
          </>
        )}
      </>
    );
  },
);
```

**Why is this needed now?**  
Following single-responsibility principles, `ListControl` focuses specifically on iterating over and rendering the loaded account names from `vm.displayValues`.

---

### Step 4 — Update BoundButtonControl for Input & Debouncing

Edit `HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx`.

Update `BoundButtonControl` to render a `TextField` for bound input with a 300ms component-local debounce timer using `useState` and `useRef`:

```tsx
import * as React from "react";
import { Stack, Text, TextField } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import { ServiceProviderContext } from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";

export interface BoundButtonControlProps {}

export const BoundButtonControl = observer(
  (props: BoundButtonControlProps): React.JSX.Element => {
    const serviceProvider = React.useContext(ServiceProviderContext);
    const vm = serviceProvider.get<ViewModel>("vm");
    const [input, setInput] = React.useState<string>(vm.boundValue);
    const debounceTimer = React.useRef<number | undefined>(undefined);

    return (
      <>
        <Stack
          horizontal={false}
          verticalAlign={"center"}
          style={{ width: "100%", padding: "10px" }}
        >
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
            <Text
              variant={"medium"}
              block
              style={{ textAlign: "center", marginTop: "10px" }}
            >
              Current bound value: {vm.boundValue}
            </Text>
          </Stack.Item>
        </Stack>
      </>
    );
  },
);
```

**Why is this needed now?**  
Using component-local state (`input`) with a render-stable timer (`useRef`) prevents triggering PCF output updates on every single keystroke, providing smooth user input while maintaining `boundValue` synchronization in the ViewModel.

---

### Step 5 — Update StartingTemplateControlMain

Edit `HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx`.

Import `ViewModel` and `ListControl`, retrieve the ViewModel, and render conditional loading and loaded account views:

```tsx
import React = require("react");
import { Stack, Text } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import {
  ServiceProvider,
  ServiceProviderContext,
} from "../Models/ServiceProvider";
import { ViewModel } from "../Models/ViewModel";
import { FieldControl } from "./FieldControl";
import { BoundButtonControl } from "./BoundButtonControl";
import { ListControl } from "./ListControl";

export interface StartingTemplateControlMainProps {
  serviceProvider: ServiceProvider;
}

export const StartingTemplateControlMain = observer(
  (props: StartingTemplateControlMainProps): React.JSX.Element => {
    const vm = props.serviceProvider.get<ViewModel>("vm");

    return (
      <>
        <ServiceProviderContext.Provider value={props.serviceProvider}>
          <Stack
            horizontal={false}
            verticalAlign={"center"}
            style={{ width: "100%" }}
          >
            <Stack.Item>
              <Text variant={"xLarge"} block style={{ textAlign: "center" }}>
                Welcome to PCF Hello World
              </Text>
            </Stack.Item>
            <Stack.Item>
              <FieldControl />
            </Stack.Item>
            <Stack.Item>
              <BoundButtonControl />
            </Stack.Item>
            {vm.loading && (
              <Stack.Item>
                <Text variant={"medium"} block style={{ textAlign: "center" }}>
                  Loading accounts...
                </Text>
              </Stack.Item>
            )}
            {vm.displayValues.length > 0 && (
              <Stack.Item>
                <Text
                  variant={"medium"}
                  block
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    fontWeight: "bold",
                  }}
                >
                  Loaded Accounts:
                </Text>
                <ListControl />
              </Stack.Item>
            )}
          </Stack>
        </ServiceProviderContext.Provider>
      </>
    );
  },
);
```

---

### Step 6 — Register DataverseService and Trigger Data Load in index.ts

Edit `HelloWorldControl\HelloWorldControl\index.ts`.

1. Import `DataverseService`.
2. Register `DataverseService` in `init()` under key `"dv"`.
3. In `updateView()`, retrieve `DataverseService`, set raw input parameters, and trigger data loading when `!vm.loading && vm.displayValues.length === 0`.
4. In `getOutputs()`, return `boundField: this.viewModel.boundValue`.

```ts
import React = require("react");
import { createRoot } from "react-dom/client";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ServiceProvider } from "./Models/ServiceProvider";
import { ViewModel } from "./Models/ViewModel";
import { DataverseService } from "./Models/DataverseService";
import { StartingTemplateControlMain } from "./Components/StartingTemplateControlMain";

export class HelloWorldControl implements ComponentFramework.StandardControl<
  IInputs,
  IOutputs
> {
  private _container: HTMLDivElement;
  serviceProvider: ServiceProvider;
  viewModel: ViewModel;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this._container = container;
    this.viewModel = new ViewModel();
    this.viewModel.refresh = () => {
      notifyOutputChanged();
    };
    this.serviceProvider = new ServiceProvider();
    this.serviceProvider.register("vm", this.viewModel);
    this.serviceProvider.register(
      "dv",
      new DataverseService(context.webAPI, context),
    );
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const dv = this.serviceProvider.get<DataverseService>("dv");
    const vm = this.viewModel;
    vm.set("inputValue", context.parameters.inputField?.raw ?? "");
    vm.set("boundValue", context.parameters.boundField?.raw ?? "");

    if (!vm.loading && vm.displayValues.length === 0) {
      vm.set("loading", true);
      dv.loadData()
        .then((result) => {
          vm.set(
            "displayValues",
            result.map((entity) => entity.name ?? ""),
          );
        })
        .catch((error) => {
          console.error("Error loading accounts:", error);
          vm.set("displayValues", []);
        })
        .finally(() => {
          vm.set("loading", false);
        });
    }

    const reactRoot = createRoot(this._container);
    reactRoot.render(
      React.createElement(StartingTemplateControlMain, {
        serviceProvider: this.serviceProvider,
      }),
    );
  }

  public getOutputs(): IOutputs {
    return {
      boundField: this.viewModel.boundValue,
    };
  }

  public destroy(): void {}
}
```

---

### Step 7 — Build and test

From the PCF project folder:

```powershell
npm run build
npm run start
pac pcf push
```

Test in your Power Apps environment to confirm account names are fetched and rendered upon control initialization. There is a limitation of the harness where read multiple are blocked, so we need to deploy to see it in action.

---

### Completion checklist

- [ ] `DataverseService.ts` exists and exposes `loadData()`.
- [ ] `ViewModel` includes observable `displayValues` and `loading`.
- [ ] `ListControl.tsx` exists and renders `vm.displayValues`.
- [ ] `BoundButtonControl.tsx` uses debounced local `useState` + `useRef` input updating `vm.boundValue`.
- [ ] `index.ts` registers `dv` in `ServiceProvider`.
- [ ] `updateView()` loads accounts asynchronously and updates `vm.loading` and `vm.displayValues`.
- [ ] `getOutputs()` returns `{ boundField: this.viewModel.boundValue }`.
- [ ] `npm run build` and `npm run lint` pass without errors.

To compare your result with the completed checkpoint, run this from the repository root:

```powershell
git diff --stat origin/module-4-done -- HelloWorldControl\HelloWorldControl\Models\DataverseService.ts HelloWorldControl\HelloWorldControl\Models\ViewModel.ts HelloWorldControl\HelloWorldControl\Components\ListControl.tsx HelloWorldControl\HelloWorldControl\Components\BoundButtonControl.tsx HelloWorldControl\HelloWorldControl\Components\StartingTemplateControlMain.tsx HelloWorldControl\HelloWorldControl\index.ts
```

No output means your code matches `module-4-done`!

**Next Steps:** You have completed the core workshop modules! You now have a production-ready, testable PCF architecture with MobX state management, ServiceProvider dependency injection, isolated Dataverse integration, and clean React components.

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
- [PCF Output Properties](https://learn.microsoft.com/power-apps/developer/component-framework/manifest-schema-reference/property)

---

## 🙌 Credits

Built for **South Coast Summit 2025**.  
Updated for **Nordic Summit 2026**.  
Thanks to Carl Cookson for the always incredible assistance!

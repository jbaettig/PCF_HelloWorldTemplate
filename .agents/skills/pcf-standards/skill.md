---
name: pcf-standards
description: Build, extend, debug, and review React-based Power Apps Component Framework controls using the PCF_HelloWorldTemplate architecture. Use for PCF work that should use MobX for shared state, one central ViewModel, a control-scoped ServiceProvider, DataverseService isolation, separate services for external APIs, and human-readable code.
license: MIT
compatibility: Intended for TypeScript React PCF controls using MobX, mobx-react-lite, Fluent UI, pcf-scripts, and the Microsoft Power Apps Component Framework.
metadata:
  author: mattybeard
  version: "1.0"
  reference-repository: "https://github.com/mattybeard/PCF_HelloWorldTemplate"
---

# Power Platform PCF control development

Use this skill when creating, extending, debugging, or reviewing a React-based PCF control derived from `PCF_HelloWorldTemplate`.

The goal is predictable code that a human developer can understand, debug, and safely modify after AI-generated changes.

Treat the reference repository as the approved architectural baseline. Preserve its established implementation choices unless the user requests a broader refactor or a choice directly prevents the requested work from functioning.

## Core architecture

Unless the project explicitly documents another pattern:

1. Use MobX for authoritative shared control state.
2. Use one control-scoped central ViewModel.
3. Store the ViewModel and services in one control-scoped ServiceProvider.
4. Give React components access to the ServiceProvider through React context.
5. Do not pass shared state fields or service instances through chains of component props.
6. Keep all Dataverse communication inside `DataverseService`.
7. Put each third-party or external API integration in its own service class.
8. Register services in the ServiceProvider using consistent keys.
9. Keep React components focused on rendering and user interaction.
10. Allow component-local React state and timers for genuinely local interaction concerns, including draft input and debounced commits.

## Scope of reviews

Apply this skill primarily to code added or changed by the current task.

Do not generate unrelated findings against approved baseline code merely because another implementation might be cleaner.

Only raise a pre-existing issue when it:

- directly blocks the requested work
- causes the project not to build or run
- creates a clear correctness failure in the affected code path
- was explicitly included in the requested review

Do not perform broad unsolicited refactors.

# State management

## Central ViewModel

Use the central ViewModel as the source of truth for shared and committed control state, including:

- PCF input and output values after they are committed
- data shared by multiple components
- loading and user-visible error state shared by the control
- selected records used outside one component
- shared filtering, paging, and sorting
- state used by services or control-level workflows
- actions that represent meaningful state changes
- a toggle or preference that controls how a shared or bound value is displayed, formatted, or derived (e.g., a "show encoded value" checkbox for a bound field), even if only one component currently reads it

Use `makeObservable` or `makeAutoObservable` consistently.

Prefer explicit, intent-revealing actions such as:

- `setFrameworkInputs`
- `setAllocatedSize`
- `setBoundValueFromUser`
- `loadContacts`
- `selectRecord`
- `clearError`

A generic setter may remain where it is already the established template pattern, but prefer named actions for non-trivial behavior.

Components that read observable state should use `observer`.

Mutate observable state through MobX actions. After `await`, use an action method or `runInAction` before changing observables.

## Component-local React state

MobX is the default for shared state, but React hooks are valid for state and resources owned only by one component's interaction lifecycle.

Acceptable component-local state includes:

- a draft text value before it is committed to the ViewModel
- a component-owned debounce timer
- focus, hover, expanded, menu, dialog, or temporary validation-display state
- a DOM reference
- integration with a React-only lifecycle
- other temporary visual state that no sibling component or service needs

Not acceptable as component-local state: a toggle, mode, or derived value that governs how a shared or bound ViewModel value is displayed elsewhere. This can look like simple UI state (a checkbox, a dropdown), but it is a display mode for authoritative data rather than transient component chrome, so it belongs in the ViewModel as observable state with a named or generic `set` action, not `useState`. Example: a "show HTML encoded" checkbox that changes how a bound field's committed value is rendered.

A local draft value may temporarily mirror a ViewModel value while the user is editing. The ViewModel remains the authoritative committed value. This is not considered improper duplication of shared state.

A debounce may remain in the component even when its eventual callback updates the ViewModel and calls `notifyOutputChanged`.

Do not report component-local draft state or a component-owned debounce timer as an architectural violation solely because it eventually changes a PCF output.

Move a debounce to the ViewModel or a service only when it:

- is shared by multiple components
- represents control-level or business workflow
- must survive component unmounting
- must be reused independently of the component
- coordinates multiple operations or services

### Recommended component-local debounce pattern

Use `useState` for the draft value and `useRef` for a timer handle that must persist across renders.

```tsx
const [input, setInput] = React.useState(vm.boundValue);
const debounceTimer = React.useRef<number | undefined>(undefined);

const commitValue = (value: string): void => {
  vm.set("boundValue", value);
  vm.refresh();
};

const handleChange = (value: string): void => {
  setInput(value);

  window.clearTimeout(debounceTimer.current);
  debounceTimer.current = window.setTimeout(() => {
    commitValue(value);
  }, 300);
};

const handleBlur = (): void => {
  window.clearTimeout(debounceTimer.current);
  commitValue(input);
};
```

A plain `let debounceTimer` inside a function component is recreated on every render and cannot reliably cancel the previous render's timer. Prefer `useRef` when cancellation must work across renders.

Clean up a pending timer with the component's React lifecycle when that cleanup is required by the component's behavior. Do not move a component-owned timer into the PCF control's `destroy`, the ViewModel, or a service merely to satisfy an architectural rule.

# React components

Components should normally:

1. obtain the ServiceProvider from `ServiceProviderContext`
2. retrieve the ViewModel or required service
3. render state
4. call a ViewModel action in response to user interaction

Components must not:

- call `context.webAPI` directly
- use `fetch`, Axios, `XMLHttpRequest`, or another HTTP client directly for application integrations
- construct shared service instances
- contain Dataverse query construction
- parse substantial external API payloads
- directly mutate MobX observables outside actions
- pass shared fields or services through multiple component layers

Props are appropriate for presentational configuration such as labels, icons, layout options, and immutable display settings.

Use Fluent UI components where appropriate and preserve accessible labels, keyboard behavior, focus handling, and useful loading or error feedback.

# ServiceProvider

Use one ServiceProvider associated with the PCF control instance.

Store within it:

- the central ViewModel
- `DataverseService`
- services for external APIs
- other meaningful shared dependencies

Registration and retrieval keys must match. Preserve existing short keys such as `vm` or `dv` when they are already used consistently, or migrate every usage together in one focused change.

Do not require:

- a typed `Map` when the approved implementation uses an untyped map
- a specific missing-service error-message format
- a replacement ServiceProvider implementation
- service registration to move to another lifecycle method solely as a stylistic preference

Do not report service replacement or re-registration performed by the approved template lifecycle as a defect unless it directly causes the requested feature to fail.

# DataverseService

`DataverseService` is the only location for Dataverse communication.

Keep the following inside it:

- `context.webAPI` calls
- record retrieval, creation, update, and deletion
- OData, FetchXML, and Web API query construction
- Custom API calls
- Dataverse-specific request configuration
- mapping Dataverse responses into application models
- Dataverse-specific error normalization

Prefer typed request and response models rather than exposing raw `any` values to components.

```ts
export interface ContactSummary {
  firstname?: string;
  lastname?: string;
}

async loadContacts(): Promise<ContactSummary[]> {
  const response = await this.webApi.retrieveMultipleRecords(
    "contact",
    "?$select=firstname,lastname&$top=10",
  );

  return (response?.entities ?? []) as ContactSummary[];
}
```

## Promise style

Prefer returning or awaiting an existing Promise rather than wrapping it in `new Promise` without a functional reason.

Good reasons for explicit Promise construction include:

- adapting a callback-only API
- coordinating multiple callbacks into one Promise
- implementing custom cancellation or completion behavior
- deliberately transforming resolve and reject behavior that cannot be expressed clearly with `async`/`await` or `.then`

For new or modified code, an unnecessary wrapper may be reported as a maintainability suggestion. It is not an architectural or high-severity blocker by itself.

Do not refactor existing template Promise wrappers unless the method is already being changed, the user asks for the cleanup, or the wrapper causes incorrect behavior.

Preserve the original error object where practical rather than rejecting only `error.message`.

# External API services

Each external API should have its own service, for example:

- `AddressLookupService`
- `ValidationService`
- `TelemetryService`

The service should own:

- endpoint construction
- authentication headers or token usage
- request and response models
- transport calls
- response mapping
- integration-specific error handling

Register the service with the ServiceProvider and access it through the established dependency pattern.

Do not embed client secrets, private API keys, or confidential credentials in a PCF bundle. Use an appropriate server-side proxy or platform-managed authentication where secrets are required.

# PCF lifecycle

Follow the lifecycle pattern already established by the reference template.

Do not report these approved baseline choices as defects unless the user specifically asks for a lifecycle review or they directly cause the requested work to fail:

- creating or rendering the React root according to the existing `updateView` pattern
- an otherwise empty `destroy` method
- refreshing or re-registering `DataverseService` during `updateView`
- the current ServiceProvider storage implementation

When introducing a genuinely long-lived control-level listener, MobX reaction, subscription, or cancellable operation, manage it in the most appropriate existing lifecycle location.

Component-owned timers and effects may be managed within the React component and do not need to be transferred to the PCF lifecycle.

# Human-readable implementation standard

Write code for the developer who must diagnose it later.

- Prefer descriptive names over clever abstractions.
- Keep state transitions easy to locate.
- Keep service boundaries obvious.
- Use typed models where they add useful clarity.
- Avoid hidden side effects.
- Do not leave placeholder methods, dead code, unused imports, or commented-out implementations.
- Do not add unexplained lint suppressions.
- Do not hide errors in empty `catch` blocks.
- Avoid unrelated changes in a focused task.

# Implementation workflow

When implementing a feature:

1. Inspect `ControlManifest.Input.xml`, `index.ts`, `ServiceProvider`, the ViewModel, relevant services, and affected components.
2. Determine whether each new piece of state is shared/committed or genuinely component-local.
3. Put authoritative shared state in the ViewModel.
4. Keep local draft, visual, and debounce state in the component where appropriate.
5. Add typed models for new service data where useful.
6. Add or extend the correct service boundary.
7. Register new shared services using the project's existing ServiceProvider pattern.
8. Keep components focused on rendering and user intent.
9. Update the manifest only when inputs, outputs, resources, permissions, or feature usage change.
10. Run the repository's available formatting, lint, TypeScript, and build commands.
11. Review only the requested change and directly affected code against this skill.

Do not include unrelated lifecycle, ServiceProvider, cleanup, or asynchronous-style refactors unless necessary for the task or requested by the user.

# Review checklist

Apply this checklist to code added or changed by the task:

- [ ] There is one central ViewModel for authoritative shared control state.
- [ ] The ViewModel and shared services use the established ServiceProvider.
- [ ] React state is genuinely component-local, including permitted draft and debounce state.
- [ ] Local draft state is not incorrectly treated as a second authoritative state store.
- [ ] A toggle or derived value that governs how shared/bound ViewModel data is displayed is stored as observable ViewModel state, not local `useState`.
- [ ] Component-owned debounce timers use a render-stable handle such as `useRef` where required.
- [ ] MobX observable mutations occur through actions.
- [ ] Components reading observable state use `observer`.
- [ ] Dataverse calls are inside `DataverseService`.
- [ ] Each new third-party API has its own service.
- [ ] ServiceProvider registration and retrieval keys match.
- [ ] Components do not directly construct shared services.
- [ ] New service responses use useful typed models rather than leaking raw payloads through the UI.
- [ ] Loading state is cleared on success and failure where loading state is used.
- [ ] Output changes call `notifyOutputChanged` intentionally and avoid loops.
- [ ] No client-side secrets are introduced.
- [ ] No placeholder code, dead code, unexplained lint suppression, or commented-out implementation is introduced.
- [ ] Available lint and build commands pass.

# Review blockers

Treat these as defects when introduced by or directly relevant to the requested change:

- a service is registered under one key and retrieved under another
- a component directly communicates with Dataverse or an external API
- a second central ViewModel or independent dependency container is introduced
- authoritative shared state is duplicated in React hooks without a genuine local draft, visual-state, or debounce purpose
- a referenced ViewModel action does not exist
- a MobX observable is mutated outside an action
- a Promise rejection can leave the control permanently loading
- a client-side secret or private credential is introduced
- the agent claims checks passed without running them

Do not treat these as review blockers:

- component-local `useState` for draft input
- component-local `useRef` or timers for debounced commits
- a local debounce that ultimately updates the ViewModel or a PCF output
- existing template React-root handling
- an empty `destroy` method when the requested change adds no unhandled control-level resource
- approved service re-registration behavior
- the existing untyped ServiceProvider map
- existing ServiceProvider error-message wording
- an existing explicit Promise wrapper that is not part of the requested change

# Final response

For coding work, briefly state:

- what changed
- which ViewModel and service boundaries were used
- which checks were run and their outcome
- any directly relevant issue that remains

Do not claim the project builds or passes lint unless those checks actually ran successfully.

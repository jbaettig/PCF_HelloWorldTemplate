# From Scratch to Solid — PCF Example

Supporting code for my **South Coast Summit 2025** session:  
**“From Scratch to Solid: A Reusable Framework for PCF Components”**  

Updated for **Nordic Summit 2026**, with the same core session content plus a new Copilot **skill** (`pcf-standards`) that captures the architecture as reusable AI guidance — see [Copilot Skill](#-copilot-skill-pcf-standards) below.

This repository contains a simple **HelloWorld PCF control** and an accompanying **Dataverse Custom API**. Together, they illustrate the patterns I talked about in the presentation: **Service Provider, ViewModel, MobX, Fluent UI, and Output Parameters.**  

---

## 📑 What’s Inside  

### PCF Control (`HelloWorldControl`)  
- **React + Fluent UI** interface  
- **MobX ViewModel** for state management  
- **Service Provider** wiring up the ViewModel, Dataverse API service, and utilities  
- Example of calling a **Custom API** and displaying results  
- Demonstrates **input properties** (bound + unbound)  

### Dataverse Custom API (`HelloWorldExample.Api`)  
- C# plugin project exposing a simple Custom API  
- Accepts a JSON payload  
- Returns a JSON response with text + sample GUIDs  
- Shows how to handle complex objects and pass them to PCF  

---

## 🚀 Getting Started  

### Prerequisites  
- A laptop with the ability to install Node.js, VS Code and the Power Platform CLI
- VS Code with the Github Copilot extentsion, installed, signed in and with agent mode enabled.
- Node.js 18+  
- Power Platform CLI (`pac`) installed  (install globally with npm -i -g pac or install the Power Platform Tools extension)
- A Dataverse environment with the Custom API deployed  (a developer environment is more than adequate for our lab)

### Build & Test the PCF Control  
Clone this repository
Confirm you are in the PCF Control directory (HelloWorldControl)
Confirm you have the Power Platform CLI installed and logged in to your Dataverse environment. Then run:n
```bash
npm install
npm run build
pac pcf push
```

### Deploy the Custom API  
- Build the C# project in Visual Studio  
- Register the plugin and Custom API in your Dataverse solution  
- Update the PCF control’s service class if your API name differs  

---

## 🧩 Key Concepts Demonstrated  

- **PCF Basics** → how to scaffold, build, and push a control  
- **Fluent UI** → accessible, consistent UI components  
- **MobX ViewModel** → observable state + actions + computed values  
- **Service Provider** → central registry for ViewModel, services, and utilities  
- **Custom API integration** → calling Dataverse logic from PCF via a service layer  
- **Output parameters** → binding PCF values back to the form (shown in the deck; partial in this code)  

---

## 📦 Packaging & Deployment  

- Use `pac pcf push` for quick testing  
- Add the control to a solution and package via `pac solution add-reference` for ALM scenarios  
- The slide deck also covers CI/CD approaches (e.g., Azure DevOps/GitHub Actions)  

---

## 🤖 Copilot Skill (`pcf-standards`)

New for **Nordic Summit 2026**: this repo ships a Copilot **skill** at [`.agents/skills/pcf-standards/skill.md`](.agents/skills/pcf-standards/skill.md). A skill is a reusable, packaged set of instructions that GitHub Copilot (and other Copilot-compatible agents) can load automatically to apply this repository's architecture — MobX ViewModel, ServiceProvider, DataverseService isolation, and component conventions — when working on PCF controls.

**How to use it:**

- **In this repo:** VS Code Copilot auto-discovers skills under `.agents/skills/`. Just ask Copilot Chat to build, extend, debug, or review PCF control code, and it will pick up the `pcf-standards` guidance automatically — no extra prompting required.
- **In another PCF project:** Copy the `.agents/skills/pcf-standards/` folder into that repository (or reference this repo via the `reference-repository` metadata in the skill) so Copilot applies the same conventions there.
- **Manually pointing Copilot at it:** If auto-discovery doesn't trigger, ask Copilot Chat to read `.agents/skills/pcf-standards/skill.md` before making changes.

The skill encodes the same patterns covered in the talk (central ViewModel, ServiceProvider, DataverseService, component rules) so AI-assisted changes stay consistent with the approved architecture instead of introducing ad-hoc patterns.

---

## ⚠️ Notes  

- This is **demo code** — designed to show the framework approach rather than be production-ready.  
- Error handling, accessibility, and localization are minimal.  
- `node_modules` and build output are intentionally excluded. Run `npm install` before building.  

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


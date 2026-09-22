/* eslint-disable @typescript-eslint/no-empty-function */
import React = require("react");
import { createRoot } from "react-dom/client";
import { Theme } from "@fluentui/react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ServiceProvider } from "./Models/ServiceProvider";
import { ViewModel } from "./Models/ViewModel";
import { DataverseService } from "./Models/DataverseService";
import { StartingTemplateControlMain } from "./Components/StartingTemplateControlMain";

export class HelloWorldControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  serviceProvider: ServiceProvider;
  viewModel: ViewModel;

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param _context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param _notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param _state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   */
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
    this.viewModel.openRecord = (entityName, recordId) => {
      context.navigation
        .openForm({
          entityName,
          entityId: recordId,
        })
        .catch((error: unknown) => {
          console.error(`Error opening ${entityName} record:`, error);
        });
    };
    this.serviceProvider = new ServiceProvider();
    this.serviceProvider.register("vm", this.viewModel);
    this.serviceProvider.register("dv", new DataverseService(context.webAPI, context));
    context.mode.trackContainerResize(true);
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
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
            result
              .filter((entity) => entity.accountid)
              .map((entity) => ({ id: entity.accountid as string, name: entity.name ?? "Unnamed account" })),
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

    if (!vm.loadingContacts && vm.contactDisplayValues.length === 0) {
      vm.set("loadingContacts", true);
      dv.loadContacts()
        .then((result) => {
          vm.set(
            "contactDisplayValues",
            result
              .filter((entity) => entity.contactid)
              .map((entity) => ({ id: entity.contactid as string, name: entity.fullname ?? "Unnamed contact" })),
          );
        })
        .catch((error) => {
          console.error("Error loading contacts:", error);
          vm.set("contactDisplayValues", []);
        })
        .finally(() => {
          vm.set("loadingContacts", false);
        });
    }

    const reactRoot = createRoot(this._container);
    reactRoot.render(
      React.createElement(StartingTemplateControlMain, {
        serviceProvider: this.serviceProvider,
        theme: context.fluentDesignLanguage?.tokenTheme as Theme | undefined,
      }),
    );
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
   */
  public getOutputs(): IOutputs {
    return {
      boundField: this.viewModel.boundValue,
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}

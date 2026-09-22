import { IInputs } from "../generated/ManifestTypes";

export interface AccountSummary {
  name?: string;
}

export interface ContactSummary {
  fullname?: string;
}

export class DataverseService {
  webApi: ComponentFramework.WebApi;
  context: ComponentFramework.Context<IInputs>;

  constructor(webApi: ComponentFramework.WebApi, context: ComponentFramework.Context<IInputs>) {
    this.webApi = webApi;
    this.context = context;
  }

  loadData(): Promise<AccountSummary[]> {
    return this.webApi
      .retrieveMultipleRecords("account", "?$select=name&$top=5")
      .then((response) => (response?.entities ?? []) as AccountSummary[]);
  }

  loadContacts(): Promise<ContactSummary[]> {
    return this.webApi
      .retrieveMultipleRecords("contact", "?$select=fullname&$top=5")
      .then((response) => (response?.entities ?? []) as ContactSummary[]);
  }
}

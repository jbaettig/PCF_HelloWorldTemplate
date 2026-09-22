import { action, makeObservable, observable } from "mobx";

export interface DisplayRecord {
  id: string;
  name: string;
}

export class ViewModel {
  inputValue: string;
  boundValue: string;
  displayValues: DisplayRecord[];
  contactDisplayValues: DisplayRecord[];
  loading: boolean;
  loadingContacts: boolean;

  refresh?: () => void;
  openRecord?: (entityName: "account" | "contact", recordId: string) => void;

  constructor() {
    this.inputValue = "";
    this.boundValue = "";
    this.displayValues = [];
    this.contactDisplayValues = [];
    this.loading = false;
    this.loadingContacts = false;

    makeObservable(this, {
      inputValue: observable,
      boundValue: observable,
      displayValues: observable,
      contactDisplayValues: observable,
      loading: observable,
      loadingContacts: observable,
      set: action,
    });
  }

  set<K extends keyof this>(key: K, value: this[K]) {
    (this[key] as this[K]) = value;
  }
}

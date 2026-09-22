import { action, makeObservable, observable } from "mobx";

export class ViewModel {
  inputValue: string;
  boundValue: string;
  displayValues: string[];
  contactDisplayValues: string[];
  loading: boolean;
  loadingContacts: boolean;

  refresh?: () => void;

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

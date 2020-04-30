export interface Action {
  _id: any;
  name: string;
}

export interface Status {
  _id: any;
  name: string;
  minTrust: number;
  actions: Action[];
}
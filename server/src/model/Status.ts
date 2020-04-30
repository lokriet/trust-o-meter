import { Schema, Types, model, Document } from "mongoose";

const ActionSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

const StatusSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  minTrust: {
    type: Number,
    required: true
  },
  actions: [{
    type: ActionSchema
  }]
});

export interface IAction extends Document {
  name: string;
}

interface IStatusBase extends Document {
  name: string;
  minTrust: number;
}

export interface IStatus extends IStatusBase {
  actions: Types.Array<IAction["_id"]>;
}

export interface IStatusPopulated extends IStatusBase {
  actions: Types.Array<IAction>;
}

export default model<IStatus>('Status', StatusSchema);
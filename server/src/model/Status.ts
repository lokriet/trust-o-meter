import { Document, model, Schema, Types } from 'mongoose';

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

export interface IStatus extends Document {
  name: string;
  minTrust: number;
  actions: Types.Array<IAction>;
}

export default model<IStatus>('Status', StatusSchema);
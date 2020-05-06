/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
import mongoose from 'mongoose';
import toJson from '@meanie/mongoose-to-json';

const { Schema } = mongoose;

const SODSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  taskDescription: {
    type: Schema.Types.String,
    required: true,
  },
  resourceStatus: {
    type: Schema.Types.ObjectId,
    ref: 'EntityType',
  },
  date: {
    type: Schema.Types.Date,
    required: true,
    default: Date.now,
  },
  varifiedBy: [
    { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  ],
});

SODSchema.plugin(toJson);
const SOD = mongoose.model('SOD', SODSchema);
export default SOD;

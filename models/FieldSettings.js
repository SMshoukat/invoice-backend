const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. clientName
  label: { type: String, default: '' },
  defaultValue: { type: String, default: '' }
}, { _id: false });

const FieldSettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fields: { type: [FieldSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('FieldSettings', FieldSettingsSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FarmSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  farmName: {
    type: String,
    required: true
  },
  farmArea: {
    type: String,
    required: true
  },
  geoJSON: {
    type: String,
    required: true
  }
});

const Farm = mongoose.model("farm", FarmSchema);

module.exports = Farm;

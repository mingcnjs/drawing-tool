const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const geometrySchema = new Schema({
  coordinates : {type:Array,"default":[]},
})

const FeaturesSchema = new Schema({
  geometry : [geometrySchema],
  others : {type:Array,"default":{}},
  properties:{type:Array,"default":{}},
  type : {type:String}
})

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
  approxArea: {
    type: Number,
  },
  geoJSON: {
    type: {type:String},
    features:[FeaturesSchema],
  }
});

const Farm = mongoose.model("farm", FarmSchema);

module.exports = Farm;

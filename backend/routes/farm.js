const express = require("express");
const router = express.Router();

const Farm = require("../models/Farm");
const validateFarmInput = require("../validation/farm");

router.post("/:_id", function(req, res) { 
  const { errors, isValid } = validateFarmInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else { 
    Farm.findByIdAndUpdate(req.params._id, {
       fieldName: req.body.fieldName,
       clientName: req.body.clientName,
       farmName: req.body.farmName,
       approxArea: req.body.approxArea,
       geoJSON: req.body.geoJSON,
    }).then(farm => {
      res.status(200).json(farm);
    });
  }
});

router.get("/:userId", (req, res) => {
  console.log("req", req.params);
  Farm.find({ userId: req.params.userId })
    .sort({ date: -1 })
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

router.post("/", function(req, res) {
  var ObjectId = require('mongodb').ObjectID
  var id = new ObjectId();
  const { errors, isValid } = validateFarmInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
   const newFarm = new Farm({
     userId: req.body.userId,
     fieldName: req.body.fieldName,
     clientName: req.body.clientName,
     farmName: req.body.farmName,
     approxArea: req.body.approxArea,
     geoJSON: req.body.geoJSON,
     Id:id 
   });
   newFarm.save().then(farm => {
      res.status(200).json(farm);
   });
//   res.status(400).json({id:id});
  }
});

module.exports = router;

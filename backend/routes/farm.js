const express = require("express");
const router = express.Router();

const User = require("../models/Farm");
const validateFarmInput = require("../validation/farm");

router.post("/", function(req, res) {
  const { errors, isValid } = validateFarmInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
console.log(req.body.approxArea);
   const newFarm = new User({
     userId: req.body.userId,
     fieldName: req.body.fieldName,
     clientName: req.body.clientName,
     farmName: req.body.farmName,
     approxArea: req.body.approxArea,
     geoJSON: req.body.geoJSON,
   });
   newFarm.save().then(farm => {
      res.status(200).json(farm);
   });
  }
});

module.exports = router;

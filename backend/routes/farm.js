const express = require("express");
const router = express.Router();

const User = require("../models/Farm");

router.post("/", function(req, res) {
console.log(req.body.farmArea)
   const newFarm = new User({
     userId: req.body.userId,
     fieldName: req.body.fieldName,
     clientName: req.body.clientName,
     farmName: req.body.farmName,
     farmArea: req.body.farmArea,
     geoJSON: req.body.geoJSON,
   });
   newFarm.save().then(farm => {
      res.status(200).json(farm);
   });
});

module.exports = router;

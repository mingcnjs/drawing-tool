const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");

const User = require("../models/Customer");
const validateCustomerInput = require("../validation/customer");
router.post("/register", function(req, res) {
  console.log(req.body);
  const { errors, isValid } = validateCustomerInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
    console.log("famerEmail>>>>>", req.body.farmerEmail);
    User.findOne({
      farmerEmail: req.body.farmerEmail
    }).then(user => {
      if (user) {
        res.status(400).json({
          farmerEmail: "Email already exists"
        });
      } else {
        const avatar = gravatar.url(req.body.farmerEmail, {
          s: "200",
          r: "pg",
          d: "mm"
        });
        const newUser = new User({
          userId: req.body.userId,
          operationName: req.body.operationName,
          farmerName: req.body.farmerName,
          farmerEmail: req.body.farmerEmail,
          growerCustomerNumber: req.body.growerCustomerNumber,
          avatar
        });
        newUser.save().then(user => {
          res.status(200).json(user);
        });
      }
    });
  }
});

module.exports = router;

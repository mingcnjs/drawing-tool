const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");

const User = require("../models/Customer");
const validateCustomerInput = require("../validation/customer");

router.get("/:userId", (req, res) => {
  console.log("req", req.params);
  User.find({ userId: req.params.userId })
    .sort({ date: -1 })
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

router.post("/register", function(req, res) {
  console.log(req.body);
  const { errors, isValid } = validateCustomerInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
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
router.delete("/:id", function(req, res) {
  Book.findById({ _id: req.params.id })
    .then(dbModel => dbModel.remove())
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

module.exports = router;

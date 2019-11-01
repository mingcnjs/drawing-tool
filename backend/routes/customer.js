const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const Customer = require("../models/Customer");
const Farm = require("../models/Farm");
const validateCustomerInput = require("../validation/customer");
const sgMail = require("@sendgrid/mail");
const JSZip = require("jszip");
const shpwrite = require("shp-write");
const nanoS3 = require("nano-s3");

sgMail.setApiKey(
  `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`
);

router.get("/:userId", (req, res) => {
  Customer.find({ userId: req.params.userId })
    .sort({ date: -1 })
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

router.post("/sendBoundaries", function(req, res) {
  const customerId = req.body.customerId;
  if (!customerId) {
    res.status(400).json("Send to who?");
  } else {
    Customer.findById(customerId).then(customer => {
      Farm.find({
        userId: customerId
      })
        .then(_fields => {
          const fields = JSON.parse(JSON.stringify(_fields));
          if (fields.length === 0) {
            res.status(400).json("Customer have no field?");
          } else {
            var zip = new JSZip();
            fields.forEach(field => {
              let shapeGeoJSON = {};
              shapeGeoJSON.type = "FeatureCollection";
              shapeGeoJSON.features = [];
              let shape = field.geoJSON.features;
              for (let ishape = 0; ishape < shape.length; ishape++) {
                let f = {};
                for (let ikeys in shape[ishape]) {
                  if (shape[ishape][ikeys].length === 1) {
                    f[ikeys] = shape[ishape][ikeys][0];
                  } else {
                    f[ikeys] = shape[ishape][ikeys];
                  }
                }
                shapeGeoJSON.features.push(f);
              }
              const b64string = shpwrite.zip(shapeGeoJSON, {
                folder: "",
                types: {
                  point: `${customer.operationName}_${field.farmName}_${field.fieldName}__points`,
                  polygon: `${customer.operationName}_${field.farmName}_${field.fieldName}__polygons`,
                  line: `${customer.operationName}_${field.farmName}_${field.fieldName}__lines`
                }
              });
              zip.file(
                `${customer.operationName}_${field.farmName}_${field.fieldName}.zip`,
                new Buffer(b64string, "base64")
              );
            });
            zip
              .generateAsync({ type: "nodebuffer" })
              .then(function(content) {
                const fileName = `${new Date().getMonth()}${new Date().getDate()}${new Date().getFullYear()}__${Date.now()}.zip`;
                const options = {
                  // AWS Config
                  // Environment variables strongly recommended for keys
                  accessKeyId: "AKIAIZ6AOEOZT3DH3EIQ",
                  secretAccessKey: "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",

                  // protocol is optional, defaults to https
                  protocol: "https",
                  host: "s3.ap-southeast-1.amazonaws.com",
                  bucket: "manuel-growers",

                  // Name of uploaded file on S3
                  filename: fileName,

                  // MIME type of file
                  contentType: `application/zip`,

                  // File data (Should be a Buffer)
                  data: content,

                  // Directory path in bucket (optional)
                  path: `temps/${customer.operationName}`,

                  // Max file size, default 2MB (optional).
                  // Required by AWS for upload policy.
                  maxFileSize: 20 * 1024 * 1024
                };

                nanoS3(options, err => {
                  if (err) {
                    res.status(500).json(`something went wrong`);
                  } else {
                    const msg = {
                      to: customer.farmerEmail,
                      from: "growers@gmail.com",
                      subject: "Test",
                      text: `https://manuel-growers.s3-ap-southeast-1.amazonaws.com/temps/${customer.operationName}/${fileName}`
                    };
                    sgMail.send(msg).then(() => {
                      res.status(200).json("ok");
                    });
                  }
                });
              })
              .catch(() => {
                res.status(500).json(`something went wrong`);
              });
          }
        })
        .catch(() => {
          res.status(500).json(`something went wrong`);
        });
    });
  }
});

router.post("/:userId", function(req, res) {
  const { errors, isValid } = validateCustomerInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
    Customer.findByIdAndUpdate(req.params.userId, {
      operationName: req.body.operationName,
      farmerName: req.body.farmerName,
      farmerEmail: req.body.farmerEmail,
      growerCustomerNumber: req.body.growerCustomerNumber
    }).then(user => {
      res.status(200).json(user);
    });
  }
});

router.post("/", function(req, res) {
  const { errors, isValid } = validateCustomerInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  } else {
    Customer.findOne({
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
        const newUser = new Customer({
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
  Customer.findByIdAndDelete(req.params.id)
    .then(dbModel => res.status(200).json({ ok: true }))
    .catch(err => res.status(422).json(err));
});

module.exports = router;

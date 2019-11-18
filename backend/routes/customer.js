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

sgMail.setApiKey(process.env.SENDGRID_KEY);

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

router.get("/:userId", (req, res) => {
  Customer.find({ userId: req.params.userId })
    .sort({ date: -1 })
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

router.post("/sendBoundaries", function(req, res) {
  const customerId = req.body.customerId;
  const receivers = req.body.receivers;
  const message = req.body.message;
  if (!customerId) {
    res.status(400).json("Send to who?");
  } else {
    if (
      !receivers ||
      !Array.isArray(receivers) ||
      receivers.some(r => !validateEmail(r))
    ) {
      res.status(400).json("Invalid receiver");
      return;
    }
    Customer.findById(customerId).then(customer => {
      Farm.find({
        userId: customerId
      })
        .then(_fields => {
          const fields = JSON.parse(JSON.stringify(_fields));
          if (fields.length === 0) {
            res.status(400).json("Customer have no field?");
            return;
          }
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
              shapeGeoJSON.features.push({
                ...f,
                properties: {
                  Farm___Name: field.farmName,
                  Field___Name: field.fieldName,
                  Grower___Name: customer.operationName
                }
              });
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
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,

                // protocol is optional, defaults to https
                protocol: "https",
                host: "s3.ap-southeast-1.amazonaws.com",
                bucket: "growers01",

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

              console.log(receivers);

              nanoS3(options, err => {
                if (err) {
                  res.status(500).json(`something went wrong`);
                } else {
                  Promise.all(
                    receivers.map(to => {
                      const msg = {
                        to,
                        from: "growers@gmail.com",
                        subject: "This is the shapefile of the boundaries",
                        html: `Hi,<br/><br/>
                      ${message ||
                        "This link contains shapefile of the boundaries, please download and extract"}<br/><br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://growers01.s3-ap-southeast-1.amazonaws.com/temps/${
                        customer.operationName
                      }/${fileName}">click here to download shapefile</a><br/>
                      <br/>
                      Thanks,<br/>
                      Growers Team
                      `
                      };
                      return sgMail.send(msg);
                    })
                  )
                    .then(() => {
                      res.status(200).json("ok");
                    })
                    .catch(() => {
                      res.status(500).json(`something went wrong`);
                    });
                }
              });
            })
            .catch(() => {
              res.status(500).json(`something went wrong`);
            });
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

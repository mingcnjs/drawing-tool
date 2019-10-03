const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateFarmInput(data) {
  let errors = {};
  console.log("data>>>>", data);
  data.fieldName = !isEmpty(data.fieldName) ? data.fieldName : "";
  data.clientName = !isEmpty(data.clientName) ? data.clientName : "";
  data.farmName = !isEmpty(data.farmName) ? data.farmName : "";
  data.approxArea = !isEmpty(data.approxArea) ? data.approxArea : 0;
  if (!Validator.isLength(data.fieldName, { min: 2, max: 30 })) {
    errors.fieldName =
      "Field Name Name must be between 2 to 30 chars";
  }
  if (Validator.isEmpty(data.fieldName)) {
    errors.fieldName = "Field Name field is required";
  }
  if (!Validator.isLength(data.clientName, { min: 2, max: 30 })) {
    errors.clientName =
      "Field Name Name must be between 2 to 30 chars";
  }
  if (Validator.isEmpty(data.clientName)) {
    errors.clientName = "Client Name field is required";
  }

  if (Validator.isEmpty(data.farmName)) {
    errors.farmName = "Farm Name field is required";
  }

  if (data.approxArea == null || data.approxArea == undefined || data.approxArea == '0') {
    errors.approxArea = "Farm Area field is required";
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};

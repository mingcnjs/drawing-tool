const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCustomerInput(data) {
  let errors = {};
  console.log("data>>>>", data);
  data.userId = !isEmpty(data.userId) ? data.userId : "";
  data.operationName = !isEmpty(data.operationName) ? data.operationName : "";
  data.farmerName = !isEmpty(data.farmerName) ? data.farmerName : "";
  data.growerCustomerNumber = !isEmpty(data.growerCustomerNumber)
    ? data.growerCustomerNumber
    : "";
  data.farmerEmail = !isEmpty(data.farmerEmail) ? data.farmerEmail : "";
  if (!Validator.isLength(data.operationName, { min: 2, max: 30 })) {
    errors.operationName =
      "Farming Operation Name must be between 2 to 30 chars";
  }

  if (Validator.isEmpty(data.operationName)) {
    errors.operationName = "Farming Operation Name field is required";
  }
  if (!Validator.isLength(data.farmerName, { min: 2, max: 30 })) {
    errors.farmerName = "Farmer Name must be between 2 to 30 chars";
  }

  if (Validator.isEmpty(data.farmerName)) {
    errors.farmerName = "Farmer Name field is required";
  }
  if (Validator.isEmpty(data.growerCustomerNumber)) {
    errors.growerCustomerNumber = "Farmer Name field is required";
  }

  if (!Validator.isEmail(data.farmerEmail)) {
    errors.farmerEmail = "Email is invalid";
  }

  if (Validator.isEmpty(data.farmerEmail)) {
    errors.farmerEmail = "Email is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

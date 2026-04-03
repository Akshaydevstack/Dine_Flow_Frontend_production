import * as Yup from "yup";

export const loginSchema = Yup.object({
  mobile_number: Yup.number()
  .min(10, "Minimum 10 numbers")
  .required("mobileNumber is required")
});
import * as Yup from "yup";

export const registrationSchema = Yup.object({
  first_name: Yup.string()
  .min(4,'Minimum 4 characters')
  .required("name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("email is required"),
  mobile_number: Yup.number()
    .min(10, "Minimum 10 numbers")
    .required("mobileNumber is required"),
});

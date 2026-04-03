export const getFirebaseErrorMessage = (error) => {
  const code = error?.code;

  switch (code) {
    case "auth/invalid-verification-code":
      return "The OTP you entered is incorrect. Please try again.";

    case "auth/code-expired":
      return "This OTP has expired. Please request a new one.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "Verification failed. Please try again.";
  }
};
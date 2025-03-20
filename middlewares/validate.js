const validate = (requestType) => {
    return (req, res, next) => {
        const {error } = requestType.validate(req.body)
        if (error) {
            console.log(error)
            return res.status(400).json({
                message: "Validation error",
                error: error.details[0].message
            })
        }
        next()
    }
}

export default validate

const emailValidator = (req, res, next) => {
  const { email } = req.body;

  // Kiểm tra xem email có tồn tại không
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  // Biểu thức chính quy để kiểm tra email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Nếu hợp lệ, tiếp tục middleware tiếp theo
  next();
};

export {
    emailValidator
}

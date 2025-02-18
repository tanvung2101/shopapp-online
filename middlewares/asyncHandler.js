
const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.log("lỗi",error.message)
            return res.status(500).json({
                message: 'Internal Server error',
                error: process.env.NODE_ENV === 'developer' ? error : ""
            })
        }
    }
}

export default asyncHandler
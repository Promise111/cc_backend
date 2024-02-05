function errorMiddleware(error, req, res, next) {
  console.log(`error middleware ${error}`);
  if (error && error?.status && error?.status != 500) {
    return res
      .status(error?.status)
      .json({ message: error?.message, data: null });
  }
  return res.status(500).json({ message: `Something went wrong.`, data: null });
}

module.exports = errorMiddleware;

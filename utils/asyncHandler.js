const asyncHandler = (fun) => async (req, res, next) => {
  try {
  return  await fun(req, res, next);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      error: err,
    });
  }
};

module.exports = asyncHandler;

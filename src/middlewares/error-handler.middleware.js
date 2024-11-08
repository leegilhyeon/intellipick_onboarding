export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.status && err.message) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({
    message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
  });
};

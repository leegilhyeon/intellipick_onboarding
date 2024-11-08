import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyRefreshToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log(authorization);
  if (!authorization) {
    return res.status(400).json({ message: "인증 정보가 없습니다." });
  }
  const [type, refreshToken] = authorization.split(" ");
  if (type !== "Bearer") {
    return res.status(401).json({
      message: "지원하지 않는 인증 방식입니다.",
    });
  }
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log(payload);
    req.user = payload;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "인증 정보가 만료되었습니다." });
    } else {
      return res
        .status(401)
        .json({ message: "유효하지 않은 인증 정보입니다." });
    }
  }
  next();
};

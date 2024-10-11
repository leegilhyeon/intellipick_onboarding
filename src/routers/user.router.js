import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sign-up:
 *   post:
 *     summary: 회원가입
 *     description: 회원가입 진행.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: email
 *               nickname:
 *                 type: string
 *                 description: nickname
 *               password:
 *                 type: string
 *                 description: password
 *               passwordConfirm:
 *                 type: string
 *                 description: passwordConfirm
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 회원가입 실패
 */

//회원가입
router.post("/sign-up", async (req, res, next) => {
  const { email, nickname, password, passwordConfirm } = req.body;

  const userCheck = await prisma.user.findUnique({ where: { email } });
  if (userCheck) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "비밀번호를 확인해주세요." });
  }
  // const hashedRound = process.env.HASH_SALT_ROUNDS;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, nickname },
  });
  return res
    .status(201)
    .json({ email, nickname, message: "회원가입이 완료되었습니다." });
});
/**
 * @swagger
 * /api/sign-in:
 *   post:
 *     summary: 로그인
 *     description: 로그인 진행.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: email
 *               password:
 *                 type: string
 *                 description: password
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 로그인 실패
 */

//로그인
router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "이메일과 비밀번호 모두 입력해주세요." });
  }

  const userCheck = await prisma.user.findUnique({
    where: { email },
  });
  if (!userCheck) {
    return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
  }

  const passwordCheck = await bcrypt.compare(password, userCheck.password);
  if (!passwordCheck) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }
  const userId = userCheck.id;
  const payload = { id: userId };
  //토큰
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "12h",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
  const token = await prisma.refreshToken.upsert({
    where: { id: userId },
    update: {
      refreshToken: hashedRefreshToken,
    },
    create: {
      userId,
      refreshToken: hashedRefreshToken,
    },
  });
  return res.status(200).json({ accessToken, refreshToken });
});

//토큰 생성
// authTokens = async (payload) => {
//   const userId = payload.id;

// };

export default router;

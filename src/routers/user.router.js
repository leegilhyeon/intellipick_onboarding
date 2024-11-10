import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import bcrypt from "bcrypt";
import { verifyRefreshToken } from "../middlewares/jwt/refresh-token.middleware.js";

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
 *               username:
 *                 type: string
 *                 description: username
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
  try {
    const { email, username, nickname, password, passwordConfirm } = req.body;

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
      data: {
        email,
        username,
        password: hashedPassword,
        nickname,
        authorities: {
          create: [{}],
        },
      },
      include: {
        authorities: true,
      },
    });
    return res.status(201).json({
      username: user.username,
      nickname: user.nickname,
      authorities: user.authorities.map((auth) => ({
        authorityName: auth.authorityName,
      })),
    });
  } catch (error) {
    next(error);
  }
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
  //const userId = userCheck.id;
  const payload = userCheck.id;
  console.log(payload, "여기");
  const token = await authTokens({ id: payload });
  //토큰

  return res.status(200).json({ token });
});

/**
 * @swagger
 * /api/token:
 *   post:
 *     summary: 토큰 재발급
 *     description: 토큰 재발급 진행
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer {token} 형식의 인증 토큰
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 토큰 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "토큰이 재발급 되었습니다."
 *                 newToken:
 *                   type: string
 *                   description: 새로 발급된 토큰
 *       400:
 *         description: 토큰 재발급 실패
 */

//재발급
router.post("/token", verifyRefreshToken, async (req, res) => {
  const user = req.user;

  const payload = { id: user.id };
  console.log(payload, "확인");
  const newToken = await authTokens(payload);
  return res
    .status(200)
    .json({ message: "토큰이 재발급 되었습니다.", newToken });
});

//토큰 생성 함수
const authTokens = async (payload) => {
  const userId = payload.id;
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
  return { accessToken, refreshToken };
};

export default router;

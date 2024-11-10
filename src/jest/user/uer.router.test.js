import request from "supertest";
import express from "express";
import userRouter from "../../routers/user.router.js";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect } from "@jest/globals";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use("/api", userRouter);

//DB초기화
beforeAll(async () => {
  await prisma.user.deleteMany();
});

describe("회원가입 및 로그인 API TEST", () => {
  const mockUser = {
    email: "test@test.com",
    username: "test",
    nickname: "testUser",
    password: "test1234",
    passwordConfirm: "test1234",
  };
  it("회원가입", async () => {
    const response = await request(app).post("/api/sign-up").send(mockUser);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(mockUser.email);
    expect(response.body.username).toBe(mockUser.username);
    expect(response.body.nickname).toBe(mockUser.nickname);
    expect(response.body).toHaveProperty("authorities");
  });

  it("로그인", async () => {
    const response = await request(app).post("/api/sign-in").send({
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("로그인 실패", async () => {
    const response = await request(app).post("/api/sign-in").send({
      email: mockUser.email,
      password: "fail",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("비밀번호가 일치하지 않습니다.");
  });

  //테스트 종료
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
});

import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerService = async ({ nama, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "SISWA",
      siswa: { create: { nama } },
    },
    include: { siswa: true },
  });
};

export const loginService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email tidak ditemukan");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Password salah");

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { user, token };
};

export const whoamiService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { siswa: true, guru: true },
  });
  if (!user) throw new Error("User tidak ditemukan");

  let name = null;
  let avatarFilename = null;

  if ((user.role === "GURU" || user.role === "ADMIN") && user.guru) {
    name = user.guru.nama;
    avatarFilename = user.guru.fotoProfil;
  } else if (user.role === "SISWA" && user.siswa) {
    name = user.siswa.nama;
    avatarFilename = user.siswa.fotoProfil;
  }

  const avatarUrl = avatarFilename
    ? `${process.env.BACKEND_URL}/uploads/${avatarFilename}`
    : null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name,
    fotoProfil: avatarUrl,
  };
};

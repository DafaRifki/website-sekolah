import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { email, password, nama, nis, alamat, tanggalLahir, fotoProfil } =
      req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const existingSiswa = await prisma.siswa.findUnique({
      where: { nis },
    });
    if (existingSiswa) {
      return res.status(400).json({ message: "NIS sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SISWA",
        siswa: {
          create: {
            nama,
            nis,
            alamat,
            tanggalLahir: new Date(tanggalLahir),
            fotoProfil: fotoProfil || null,
          },
        },
      },
      include: { siswa: true },
    });

    res.status(201).json({
      message: "Register berhasil",
      user: {
        email: newUser.email,
        role: newUser.role,
        siswa: newUser.siswa,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Email tidak ditemukan" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Password salah" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login berhasil",
    token,
    role: user.role,
  });
};

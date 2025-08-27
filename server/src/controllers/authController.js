import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // buat user + siswa
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SISWA",
        siswa: {
          create: {
            nama,
          },
        },
      },
      include: {
        siswa: true,
      },
    });

    res.status(201).json({
      message: "Register berhasil",
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        siswa: {
          id_siswa: newUser.siswa.id_siswa,
          nama: newUser.siswa.nama,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
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

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true di production
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 hari
  });

  res.json({
    message: "Login berhasil",
    token,
    role: user.role,
  });
};

export const whoami = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        siswa: true,
        guru: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    let name = null;
    let avatarFilename = null; // Ganti nama variabel agar lebih jelas

    if (user.role === "GURU" && user.guru) {
      name = user.guru?.nama;
      avatarFilename = user.guru?.fotoProfil;
    } else if (user.role === "SISWA" && user.siswa) {
      name = user.siswa?.nama;
      avatarFilename = user.siswa?.fotoProfil;
    }

    // --- PERUBAHAN DI SINI ---
    // Bangun URL lengkap jika ada nama file avatar
    const avatarUrl = avatarFilename
      ? `${process.env.BACKEND_URL}${avatarFilename}`
      : null;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        fotoProfil: avatarUrl, // Kirim URL lengkap atau null
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

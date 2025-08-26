import { useState, useEffect } from "react";
// import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  const fullText = "SMA Islam Terpadu As-Sakinah";

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDeleting) {
        // Ketik per huruf
        setText(fullText.slice(0, index + 1));
        setIndex((prev) => prev + 1);

        if (index + 1 === fullText.length) {
          // kalau sudah selesai ngetik, tunggu sebentar lalu hapus
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        // Hapus per huruf
        setText(fullText.slice(0, index - 1));
        setIndex((prev) => prev - 1);

        if (index - 1 === 0) {
          // kalau sudah habis, mulai ngetik lagi
          setIsDeleting(false);
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [index, isDeleting]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Kolom Kiri */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo + Judul */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2 font-bold text-green-700 text-2xl">
            <div className="text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <img src="/img/logo.png" alt="logo" />
            </div>
            <span>{text}</span>
          </a>
        </div>

        {/* Form Login */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Kolom Kanan (Background Image) */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/img/bgn.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

// import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const fullText = "SMA Islam Terpadu As-Sakinah";

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Kolom Kiri */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo + Judul */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-green-700 text-2xl">
            <div className="text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <img src="/img/logo.png" alt="logo" />
            </div>
            <span>{fullText}</span>
          </Link>
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

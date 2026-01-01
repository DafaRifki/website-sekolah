import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useState, useRef } from "react";
import Loading from "./Loading";
import delay from "@/lib/delay";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";
import { Eye, EyeOff } from "lucide-react";

// ----------------- VALIDASI -----------------
const formSchema = z.object({
  email: z.string().email().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

// ----------------- LOGIN FORM -----------------
export function LoginForm({ className }: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // --------- Handle Login ----------
  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await delay(500);
      const { data } = await apiClient.post("/auth/login", values);
      // console.log(data);

      // store token & user to localStorage (server returns tokens in data.data.tokens)
      const payload = data?.data;
      const accessToken = payload?.tokens?.accessToken || payload?.token;
      const refreshToken = payload?.tokens?.refreshToken;
      const user = payload?.user;

      if (accessToken) {
        // use key `accessToken` so axios interceptor (and other parts) can read it
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          // ignore serialization errors but surface small warning
          console.warn("Failed to save user to localStorage", e);
        }
      }

      toast.success("Login berhasil");
      navigate("/dashboard");
      setLoading(false);
    } catch (err: unknown) {
      // log the error for debugging
      console.error("Login error:", err);

      // Extract error message from response
      let errorMessage = "Terjadi kesalahan saat login";

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setLoading(false);
    }
    // console.log(values);
  };

  return (
    <div
      ref={cardRef}
      // onMouseMove={handleMouseMove}
      // onMouseLeave={handleMouseLeave}
      className={cn(
        "flex flex-col gap-7 rounded-2xl bg-white/90 p-8 shadow-xl backdrop-blur-md border border-gray-200 transition-transform duration-300 ease-out",
        className
      )}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold text-green-700">Login</h1>
        <p className="text-muted-foreground text-sm">
          Silakan masuk dengan akun Anda
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukan alamat Email Anda"
                      {...field}
                      autoComplete="off"
                      autoFocus
                      className="rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukan Password"
                        {...field}
                        className="rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={
                          showPassword
                            ? "Sembunyikan Password"
                            : "Lihat Password"
                        }>
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all shadow-md"
              disabled={loading}>
              {loading && <Loading />}
              Login
            </Button>
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="text-center text-sm">
        Belum punya akun?{" "}
        <Link
          to="/signup"
          className="text-green-600 font-semibold hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

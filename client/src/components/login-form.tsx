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
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // --------- Handle Tilt Effect ----------
  // const handleMouseMove = (e: React.MouseEvent) => {
  //   const card = cardRef.current;
  //   if (!card) return;

  //   const rect = card.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   const centerX = rect.width / 2;
  //   const centerY = rect.height / 2;

  //   const rotateX = ((y - centerY) / 20) * -1;
  //   const rotateY = (x - centerX) / 20;

  //   card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  // };

  // const handleMouseLeave = () => {
  //   const card = cardRef.current;
  //   if (!card) return;
  //   card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  // };

  // --------- Handle Login ----------
  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await delay(500);
      const { data } = await apiClient.post("/auth/login", values);
      // console.log(data);

      toast.success("Login berhasil", {
        onAutoClose: () => {
          navigate("/dashboard");
          setLoading(false);
        },
      });
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Terjadi kesalahan", {
        onAutoClose: () => setLoading(false),
      });
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
                    <Input
                      type="password"
                      placeholder="Masukan Password"
                      {...field}
                      className="rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 transition-all"
                    />
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

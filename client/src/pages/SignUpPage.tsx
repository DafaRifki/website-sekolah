import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import apiClient from "@/config/axios";
import delay from "@/lib/delay";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email().min(1, { message: "Email is required" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await delay(500);
      const { data } = await apiClient.post("/auth/register", values);
      // console.log(data);
      toast.success("Register Berhasil", {
        onAutoClose: () => {
          setLoading(false);
          navigate("/login");
        },
      });
    } catch (error: unknown) {
      toast.error("Terjadi kesalahan, coba lagi!", {
        onAutoClose: () => {
          setLoading(false);
        },
      });
    }
    // console.log(values);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-white">
      <div className="bg-white/90 p-10 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
        {/* Judul */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-extrabold text-green-600">Buat Akun</h1>
          <p className="text-gray-500 text-sm">
            Silahkan isi form di bawah ini untuk mendaftar
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignUp)}
            className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukan Nama Anda "
                      className="focus:ring-2 focus:ring-green-300"
                      autoComplete="off"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Alamat Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukan Alamat Email"
                      type="email"
                      className="focus:ring-2 focus:ring-green-300"
                      autoComplete="off"
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
                      {...field}
                      type="password"
                      placeholder="********"
                      className="focus:ring-2 focus:ring-green-300"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Konfirmasi Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="********"
                      className="focus:ring-2 focus:ring-green-300"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            {/* Tombol */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all">
                {loading && <Loading />}
                Daftar
              </Button>
            </div>

            {/* Link ke Login */}
            <div>
              <p className="text-gray-500 text-center text-sm">
                Sudah punya akun?{" "}
                <Link
                  to={"/login"}
                  className="text-green-600 font-medium hover:underline">
                  Login di sini
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpPage;

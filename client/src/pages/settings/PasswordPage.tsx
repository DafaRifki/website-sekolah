import React, { useEffect, useState } from "react";
import SettingsLayout from "../layout/settings/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import delay from "@/lib/delay";
import Loading from "@/components/Loading";
import apiClient from "@/config/axios";

interface User {
  id: number;
  name: string;
  email: string;
}

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password wajib diisi" }),
    newPassword: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

const PasswordPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await apiClient.get("/auth/whoami", {
          withCredentials: true,
        });
        setUser(data.user);
      } catch (error: any) {
        toast.error("Gagal mengambil user");
      }
    };
    fetchUser();
  }, []);

  const handlePasswordUpdate = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await delay(500); // simulasi delay loading
      await apiClient.patch(
        `/user/${user?.id}`,
        {
          currentPassword: values.currentPassword,
          password: values.newPassword,
        },
        { withCredentials: true }
      );

      toast.success("Password berhasil diubah");
      form.reset();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Gagal update password user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Password settings</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Update your password to keep your account secure
        </p>

        {/* Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update password</CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePasswordUpdate)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="New password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading && <Loading />}
                  Save Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default PasswordPage;

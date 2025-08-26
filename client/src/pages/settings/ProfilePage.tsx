"use client";

import React, { useEffect, useState } from "react";
import SettingsLayout from "../layout/settings/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { AlertCircleIcon } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import delay from "@/lib/delay";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

interface User {
  id: number;
  name: string;
  email: string;
}

const formSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await apiClient.get("/auth/whoami", {
          withCredentials: true,
        });
        setUser(data.user);

        // reset form values
        form.reset({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      } catch (error) {
        toast.error("Gagal mengambil user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await delay(500);
      // hit api
      const { data } = await apiClient.patch(`/user/${user?.id}`, values, {
        withCredentials: true,
      });
      // console.log(values);
      toast.success("Update Berhasil", {
        onAutoClose: () => {
          setLoading(false);
        },
      });
    } catch (error: any) {
      toast.error("Gagal update profil user", {
        onAutoClose: () => {
          setLoading(false);
        },
      });
    }
    // console.log(values);
  };

  const handleDelete = async () => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Yakin ingin menghapus akun ini?",
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        console.log(user);
        // toast.success("Hapus data user berhasil");
        Swal.fire("Terhapus!", "Akun anda sudah dihapus.", "success");
      } catch (error) {
        //
      }
    }
  };

  return (
    <SettingsLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Profile settings</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your profile and account settings
        </p>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
            <CardDescription>
              Update your name and email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdate)}
                  className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Masukkan email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading && <Loading />}
                    Save Profil
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
          {/* <CardFooter>
            <Button>Save</Button>
          </CardFooter> */}
        </Card>

        {/* Delete Account Section */}
        <Card className="mt-6 border-red-400 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Delete account</CardTitle>
            <CardDescription>
              Delete your account and all of its resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please proceed with caution, this cannot be undone
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default ProfilePage;

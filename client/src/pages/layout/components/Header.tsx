import * as React from "react";
import { Menu, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // aktif kalau scroll > 50px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md border-b" : "bg-white"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/img/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="font-sans font-semibold text-xl text-green-700">
            SMA AS-SAKINAH
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className="text-gray-800 hover:text-green-600 transition-colors">
                    Beranda
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/profil-sekolah"
                    className="text-gray-800 hover:text-green-600 transition-colors">
                    Profil
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-800 hover:text-green-600 transition-colors">
                  Guru
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-48 bg-white rounded-md shadow-lg">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/kepala-sekolah"
                          className="block px-3 py-2 rounded hover:bg-green-100">
                          Kepala Sekolah
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/guru/staff-pengajar"
                          className="block px-3 py-2 rounded hover:bg-green-100">
                          Staff Pengajar
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/struktur-organisasi"
                          className="block px-3 py-2 rounded hover:bg-green-100">
                          Struktur Organisasi
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/fasilitas"
                    className="text-gray-800 hover:text-green-600 transition-colors">
                    Fasilitas
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/berita"
                    className="text-gray-800 hover:text-green-600 transition-colors">
                    Berita
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/pendaftaran"
                    className="text-gray-800 hover:text-green-600 transition-colors">
                    Pendaftaran
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="gap-2">
            <Link to="/login">
              <LogIn size={16} />
              Masuk
            </Link>
          </Button>
          <Button asChild className="flex-1 gap-2">
            <Link to="/cek-status">
              <ShieldCheck size={16} />
              Cek Status Pendaftaran
            </Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Buka menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">Navigasi</SheetTitle>
              </SheetHeader>

              {/* Beranda */}
              <Link
                to="/"
                className="px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                Beranda
              </Link>

              {/* Profil */}
              <Link
                to="/profil-sekolah"
                className="px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                Profil
              </Link>

              {/* Guru - Submenu sederhana */}
              <div className="px-3 py-2">
                <p className="font-semibold text-gray-800">Guru</p>
                <div className="ml-3 mt-2 grid gap-1">
                  <Link
                    to="/kepala-sekolah"
                    className="block px-3 py-2 rounded hover:bg-green-50 text-sm">
                    Kepala Sekolah
                  </Link>
                  <Link
                    to="/guru/staff-pengajar"
                    className="block px-3 py-2 rounded hover:bg-green-50 text-sm">
                    Staff Pengajar
                  </Link>
                  <Link
                    to="/struktur-organisasi"
                    className="block px-3 py-2 rounded hover:bg-green-50 text-sm">
                    Struktur Organisasi
                  </Link>
                </div>
              </div>

              {/* Fasilitas */}
              <Link
                to="/fasilitas"
                className="px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                Fasilitas
              </Link>

              {/* Berita */}
              <Link
                to="/berita"
                className="px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                Berita
              </Link>

              {/* Pendaftaran */}
              <Link
                to="/pendaftaran"
                className="px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                Pendaftaran
              </Link>

              {/* Mobile actions */}
              <div className="mt-6 flex gap-2">
                <Button asChild className="flex-1 gap-2">
                  <Link to="/login">
                    <LogIn size={16} />
                    Masuk
                  </Link>
                </Button>
                <Button asChild className="flex-1 gap-2">
                  <Link to="/cek-status">
                    <LogIn size={16} />
                    Cek Status Pendaftaran
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

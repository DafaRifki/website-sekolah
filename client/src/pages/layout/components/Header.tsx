import * as React from "react";
import { Menu, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  //navigationMenuTriggerStyle,
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
        scrolled
          ? "bg-white/90 shadow-md border-b backdrop-blur supports-[backdrop-filter]:bg-white/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/img/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="font-semibold text-xl text-green-700">
            RuangBelajar
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
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Beranda
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/kelas"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Kelas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/tentang"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Tentang
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/signup">
            <Button variant="outline" className="gap-2">
              <UserPlus size={16} />
              Daftar
            </Button>
          </Link>
          <Button asChild className="gap-2">
            <Link to="/login">
              <LogIn size={16} />
              Masuk
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
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigasi</SheetTitle>
              </SheetHeader>

              <nav className="mt-4 grid gap-2">
                <a href="/" className="px-3 py-2 rounded-lg hover:bg-muted">
                  Beranda
                </a>
                <a href="/kelas" className="px-3 py-2 rounded-lg hover:bg-muted">
                  Kelas
                </a>
                <a
                  href="/tentang"
                  className="px-3 py-2 rounded-lg hover:bg-muted"
                >
                  Tentang
                </a>
              </nav>

              {/* Mobile actions */}
              <div className="mt-6 flex gap-2">
                <Button variant="outline" asChild className="flex-1 gap-2">
                  <Link to="/signup">
                    <UserPlus size={16} />
                    Daftar
                  </Link>
                </Button>
                <Button asChild className="flex-1 gap-2">
                  <Link to="/login">
                    <LogIn size={16} />
                    Masuk
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

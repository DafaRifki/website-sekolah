import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* Kolom 1: Identitas Sekolah */}
        <div>
          <h2 className="text-2xl font-bold">SMA Islam Terpadu As-Sakinah</h2>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            Mencetak generasi yang berakhlak mulia, berprestasi, dan siap
            menghadapi tantangan global dengan bekal iman dan ilmu.
          </p>
        </div>

        {/* Kolom 2: Kontak */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Kontak Kami</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={20} /> Jl. Cibening Raya, Kp Cempaka Putih Rt.001/006 Cibening Pamijahan Bogor
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +62 814-0062-5336
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> assakinahpamijahanbogor@gmail.com
            </li>
          </ul>
        </div>

        {/* Kolom 3: Sosial Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Ikuti Kami</h3>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-yellow-300 transition-colors"
              aria-label="Facebook"
            >
              <Facebook />
            </a>
            <a
              href="https://www.instagram.com/assakinahh.id/"
              className="hover:text-yellow-300 transition-colors"
              aria-label="Instagram"
            >
              <Instagram />
            </a>
            <a
              href="https://whatsapp.com/channel/0029VawzwOtC6ZvbUcVk343p"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300 transition-colors"
              aria-label="WhatsApp">
              <FaWhatsapp size={27} />
            </a>
          </div>
        </div>
      </div>

      {/* Bawah */}
      <div className="border-t border-gray-600 mt-6 py-4 text-center text-sm text-gray-300">
        <p>
          &copy; {new Date().getFullYear()} SMA Islam Terpadu As-Sakinah. Semua
          Hak Dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

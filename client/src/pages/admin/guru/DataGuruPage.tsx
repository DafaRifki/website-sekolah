import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import apiClient from "@/config/axios";
import GuruHeader from "./components/GuruHeader";
import GuruGrid from "./components/GuruGrid";
import TambahGuruModal from "./components/TambahGuruModal";
import { useEffect, useState } from "react";

interface User {
  email: string;
  role: string;
}

interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: User | null;
}

export default function DataGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpenModal, setIsAddOpenModal] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await apiClient.get("/guru");
        setGuru(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGuru();
  }, []);

  // filter
  const filteredGuru = guru.filter((g) =>
    g.nama.toLowerCase().includes(search.toLowerCase())
  );

  // pagination logic
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuru = filteredGuru.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      <h2 className="mb-3 text-2xl font-semibold">Data Guru</h2>

      <GuruHeader
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        onAddClick={() => setIsAddOpenModal(true)}
      />

      <GuruGrid data={paginatedGuru} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              {totalPages > 5 && <PaginationEllipsis />}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Tambah Data Modal */}
      <TambahGuruModal
        isOpen={isAddOpenModal}
        onClose={() => setIsAddOpenModal(false)}
        onAdded={() => {
          apiClient.get("/guru").then((res) => setGuru(res.data.data));
        }}
      />
    </div>
  );
}

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
import { useEffect, useState } from "react";
import GuruHeader from "./components/GuruHeader";
import GuruGrid from "./components/GuruGrid";
import TambahGuruModal from "./components/TambahGuruModal";
import DetailGuruModal from "./components/DetailGuruModal";
import type { Guru } from "./components/DetailGuruModal"; 
import EditGuruModal from "./components/EditGuruModal"; 

export default function DataGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // State Modals
  const [isAddOpenModal, setIsAddOpenModal] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- PERBAIKAN STATE: Simpan Object Guru Lengkap ---
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [guruToEdit, setGuruToEdit] = useState<Guru | null>(null);

  // --- FETCH DATA ---
  const fetchGuru = async () => {
    try {
      const res = await apiClient.get("/guru");
      setGuru(res.data.data.data || res.data.data); 
    } catch (error) {
      console.error("Gagal mengambil data guru:", error);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  // --- HANDLER KLIK (Cari data lengkap dari state) ---
  const handleGuruClick = (id: number) => {
    const foundGuru = guru.find((g) => g.id_guru === id) || null;
    setSelectedGuru(foundGuru);
    setIsDetailOpen(true);
  };

  const handleGuruDeleted = (deletedId: number) => {
    fetchGuru();
    setGuru((prev) => prev.filter((g) => g.id_guru !== deletedId));
    setIsDetailOpen(false);
  };

  const handleOpenEditFromDetail = (guruData: Guru) => {
    setGuruToEdit(guruData); 
    setIsDetailOpen(false); 
    setIsEditOpen(true);    
  };

  // --- HANDLER UPDATE (Dengan Pengaman Data User/Email) ---
  const handleGuruUpdated = (updatedGuru: Guru) => {
    // 1. Update List di Grid
    setGuru((prevGuruList) => 
      prevGuruList.map((g) => {
        if (g.id_guru === updatedGuru.id_guru) {
           return {
             ...g,
             ...updatedGuru,
             // PENTING: Gunakan data user lama jika backend mengembalikan user null
             user: updatedGuru.user || g.user 
           };
        }
        return g;
      })
    );

    // 2. Update Detail Modal (Real-time update)
    if (selectedGuru && selectedGuru.id_guru === updatedGuru.id_guru) {
        setSelectedGuru((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                ...updatedGuru,
                // PENTING: Jaga email agar tidak hilang di tampilan detail
                user: updatedGuru.user || prev.user
            };
        });
    }

    fetchGuru(); // Sinkronisasi akhir dengan server

    setIsEditOpen(false);
    setGuruToEdit(null);
  };

  // --- PAGINATION & FILTER ---
  const filteredGuru = guru.filter((g) =>
    g.nama.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Grid Guru */}
      <GuruGrid 
        data={paginatedGuru} 
        onItemClick={handleGuruClick} 
      />

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
                      }}
                    >
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

      {/* --- MODAL SECTION --- */}

      <TambahGuruModal
        isOpen={isAddOpenModal}
        onClose={() => setIsAddOpenModal(false)}
        onAdded={fetchGuru}
      />

      {/* Modal Detail menggunakan props 'guruData' */}
      <DetailGuruModal
        isOpen={isDetailOpen}
        guruData={selectedGuru} 
        onClose={() => setIsDetailOpen(false)}
        onDeleted={handleGuruDeleted}     
        onEdit={handleOpenEditFromDetail} 
      />

      <EditGuruModal
        isOpen={isEditOpen}
        guru={guruToEdit}
        onClose={() => setIsEditOpen(false)}
        onUpdated={handleGuruUpdated}     
      />
    </div>
  );
}
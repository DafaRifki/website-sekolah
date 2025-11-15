import { GuruController } from "../controllers/guru.controller";
import { GuruService } from "../services/guru.service";

describe("GuruController.getAvailableForWaliKelas", () => {
  it("should return 200 with guru list", async () => {
    const mockGuru = [
      { id_guru: 1, nip: "123", nama: "Budi", jabatan: "Guru IPA" },
      { id_guru: 2, nip: "456", nama: "Ani", jabatan: "Guru Bahasa Indonesia" },
    ];

    // mock service
    jest
      .spyOn(GuruService, "getAvailableForWaliKelas")
      .mockResolvedValue(mockGuru as any);

    // mock req/res
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await GuruController.getAvailableForWaliKelas(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Available guru retrieved successfully",
      data: mockGuru,
    });
  });
});

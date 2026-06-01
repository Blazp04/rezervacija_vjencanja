using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.BandMembers;

namespace RezervacijaVjencanja.Services.BandMembers;

public interface IBandMemberService
{
    Task<ApiResponse<IEnumerable<BandMemberDto>>> GetByPartnerIdAsync(int partnerId);
    Task<ApiResponse<BandMemberDto>> CreateAsync(int partnerId, CreateBandMemberRequest request);
    Task<ApiResponse<BandMemberDto>> UpdateAsync(int partnerId, int memberId, UpdateBandMemberRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int partnerId, int memberId);
}

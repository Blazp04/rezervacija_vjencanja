using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.BandMembers;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.BandMembers;

public sealed class BandMemberService(AppDbContext db) : IBandMemberService
{
    public async Task<ApiResponse<IEnumerable<BandMemberDto>>> GetByPartnerIdAsync(int partnerId)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == partnerId))
            return ApiResponse<IEnumerable<BandMemberDto>>.Fail($"Partner with id {partnerId} was not found.");

        var members = await db.BandMembers
            .AsNoTracking()
            .Where(m => m.PartnerId == partnerId)
            .OrderBy(m => m.Name)
            .Select(m => ToDto(m))
            .ToListAsync();


        return ApiResponse<IEnumerable<BandMemberDto>>.Ok(members);
    }

    public async Task<ApiResponse<BandMemberDto>> CreateAsync(int partnerId, CreateBandMemberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<BandMemberDto>.Fail("Name is required.");

        if (!await db.Partners.AnyAsync(p => p.Id == partnerId))
            return ApiResponse<BandMemberDto>.Fail($"Partner with id {partnerId} was not found.");

        var entity = new BandMember
        {
            PartnerId = partnerId,
            Name = request.Name.Trim(),
            Role = request.Role?.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),
        };

        db.BandMembers.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<BandMemberDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<BandMemberDto>> UpdateAsync(int partnerId, int memberId, UpdateBandMemberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<BandMemberDto>.Fail("Name is required.");

        var entity = await db.BandMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.PartnerId == partnerId);

        if (entity is null)
            return ApiResponse<BandMemberDto>.Fail($"BandMember with id {memberId} was not found.");

        entity.Name = request.Name.Trim();
        entity.Role = request.Role?.Trim();
        entity.Phone = request.Phone?.Trim();
        entity.Email = request.Email?.Trim();

        await db.SaveChangesAsync();

        return ApiResponse<BandMemberDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int partnerId, int memberId)
    {
        var entity = await db.BandMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.PartnerId == partnerId);

        if (entity is null)
            return ApiResponse<bool>.Fail($"BandMember with id {memberId} was not found.");

        db.BandMembers.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static BandMemberDto ToDto(BandMember m) =>
        new(m.Id, m.PartnerId, m.Name, m.Role, m.Phone, m.Email);
}

namespace RezervacijaVjencanja.Common;

public sealed record ApiResponse<T>(T? Data, string? Error)
{
    public static ApiResponse<T> Ok(T data) => new(data, null);
    public static ApiResponse<T> Fail(string error) => new(default, error);
}

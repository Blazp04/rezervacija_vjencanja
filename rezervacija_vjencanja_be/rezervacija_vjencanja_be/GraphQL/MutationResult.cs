namespace RezervacijaVjencanja.GraphQL;

/// <summary>
/// Thin wrapper returned by every GraphQL mutation.
/// Mirrors the REST ApiResponse pattern: callers check <see cref="Error"/>
/// first; if null the operation succeeded and <see cref="Data"/> is populated.
/// </summary>
public sealed record MutationResult<T>(T? Data, string? Error)
{
    public bool Success => Error is null;
}

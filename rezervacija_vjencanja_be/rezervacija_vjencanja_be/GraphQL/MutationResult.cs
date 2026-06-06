namespace RezervacijaVjencanja.GraphQL;


public sealed record MutationResult<T>(T? Data, string? Error)
{
    public bool Success => Error is null;
}

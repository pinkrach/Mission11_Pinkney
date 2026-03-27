using Microsoft.AspNetCore.Mvc;
using Bookstore.Data;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly BookContext _context;

    public BookController(BookContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Categories with book counts for the filter sidebar (one request; avoids a separate summary route).
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<CategorySummaryDto>>> GetCategories()
    {
        var names = await _context.Books.AsNoTracking()
            .Select(b => b.Category)
            .ToListAsync();

        var rows = names
            .GroupBy(c => c ?? string.Empty)
            .Select(g => new CategorySummaryDto
            {
                Category = g.Key,
                Count = g.Count()
            })
            .OrderBy(x => x.Category)
            .ToList();

        return Ok(rows);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Book>>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string? search = null,
        [FromQuery] string[]? categories = null,
        [FromQuery] string sortBy = "title",
        [FromQuery] string sortOrder = "asc")
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        IQueryable<Book> query = _context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(term));
        }

        if (categories is { Length: > 0 })
        {
            var set = categories
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c.Trim())
                .Distinct()
                .ToList();

            if (set.Count > 0)
            {
                // OR: any book whose Category is in the selected set
                query = query.Where(b => set.Contains(b.Category));
            }
        }

        var descending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLower() switch
        {
            "author" => descending ? query.OrderByDescending(b => b.Author) : query.OrderBy(b => b.Author),
            "publisher" => descending ? query.OrderByDescending(b => b.Publisher) : query.OrderBy(b => b.Publisher),
            "price" => descending ? query.OrderByDescending(b => b.Price) : query.OrderBy(b => b.Price),
            "pages" or "pagecount" => descending ? query.OrderByDescending(b => b.PageCount) : query.OrderBy(b => b.PageCount),
            _ => descending ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
        };

        var totalCount = await query.CountAsync();
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<Book>
        {
            Items = books,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Book>> AddBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBooks), new { id = book.BookID }, book);
    }
}

public class CategorySummaryDto
{
    public string Category { get; set; } = "";
    public int Count { get; set; }
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
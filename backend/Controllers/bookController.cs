using Microsoft.AspNetCore.Mvc;
using Bookstore.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Contracts;

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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
    {
        var books = await _context.Books.AsNoTracking().ToListAsync();
        return Ok(books);
    }

    [HttpPost]
    public async Task<ActionResult<Book>> AddBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBooks), new { id = book.BookID }, book);
    }
}
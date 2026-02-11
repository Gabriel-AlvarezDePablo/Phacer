using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhacerApi.Models.Tasks;
using PhacerApi.Services;

namespace PhacerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetAll(
        [FromQuery] bool? isCompleted,
        [FromQuery] string? search,
        [FromQuery] int? priority,
        [FromQuery] string? tag,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetAllAsync(UserId, isCompleted, search, priority, tag, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(UserId, id, cancellationToken);
        if (task == null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.CreateAsync(UserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = task!.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateAsync(UserId, id, request, cancellationToken);
        if (task == null)
            return NotFound();

        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _taskService.DeleteAsync(UserId, id, cancellationToken);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}

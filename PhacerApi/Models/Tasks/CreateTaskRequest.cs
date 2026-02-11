using System.ComponentModel.DataAnnotations;
using PhacerApi.Models;

namespace PhacerApi.Models.Tasks;

public class CreateTaskRequest
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskColor Color { get; set; } = TaskColor.Gray;
    public List<string> Tags { get; set; } = [];
}

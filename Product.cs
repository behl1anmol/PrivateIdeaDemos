using System.ComponentModel.DataAnnotations;

namespace MinimalWebApiDemo.Models
{
    public class Product
    {
        public int Id
        {
            get; set;
        }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price
        {
            get; set;
        }

        public int Quantity
        {
            get; set;
        }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
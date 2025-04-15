using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly DocumentService _documentService;
        private readonly string _uploadsBasePath;

        public DocumentsController(IConfiguration configuration)
        {
            _documentService = new DocumentService(configuration);
            _uploadsBasePath = configuration.GetValue<string>("UploadsBasePath") ??
                               Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");
        }

        // GET: api/Documents
        [HttpGet]
        public ActionResult<IEnumerable<Documentt>> GetDocuments()
        {
            try
            {
                return Ok(_documentService.GetAllDocuments());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Documents/5
        [HttpGet("{id}")]
        public ActionResult<Documentt> GetDocument(int id)
        {
            try
            {
                var document = _documentService.GetDocumentById(id);

                if (document == null)
                {
                    return NotFound($"מסמך עם מזהה {id} לא נמצא");
                }

                return Ok(document);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Documents/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<Documentt>> GetDocumentsByKidId(int kidId)
        {
            try
            {
                return Ok(_documentService.GetDocumentsByKidId(kidId));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Documents/employee/5
        [HttpGet("employee/{employeeId}")]
        public ActionResult<IEnumerable<Documentt>> GetDocumentsByEmployeeId(int employeeId)
        {
            try
            {
                return Ok(_documentService.GetDocumentsByEmployeeId(employeeId));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Documents/5/content
        [HttpGet("{id}/content")]
        public ActionResult GetDocumentContent(int id)
        {
            try
            {
                // קבלת המסמך
                var document = _documentService.GetDocumentById(id);
                if (document == null)
                {
                    return NotFound($"מסמך עם מזהה {id} לא נמצא");
                }

                // קבלת תוכן המסמך
                byte[] fileContent = _documentService.GetDocumentContent(id);

                // החזרת הקובץ עם סוג התוכן המתאים
                return File(fileContent, document.ContentType ?? "application/octet-stream", document.DocName);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Documents/upload
        [HttpPost("upload")]
        public ActionResult<Documentt> UploadDocument([FromForm] DocumentUploadModel model)
        {
            try
            {
                if (model.File == null || model.File.Length == 0)
                {
                    return BadRequest("לא נבחר קובץ");
                }

                // וידוא שמספקים מידע על המסמך
                if (model.Document == null)
                {
                    return BadRequest("לא סופק מידע על המסמך");
                }

                // וידוא שיש לפחות מזהה אחד (ילד או עובד)
                if (!model.Document.KidId.HasValue && !model.Document.EmployeeId.HasValue)
                {
                    return BadRequest("יש לקשר את המסמך לילד או לעובד");
                }

                // קריאת תוכן הקובץ
                byte[] fileContent;
                using (var ms = new MemoryStream())
                {
                    model.File.CopyTo(ms);
                    fileContent = ms.ToArray();
                }

                // הוספת המסמך
                int documentId = _documentService.AddDocument(
                    model.Document,
                    fileContent,
                    model.File.FileName,
                    model.File.ContentType
                );

                model.Document.DocId = documentId;

                return CreatedAtAction(nameof(GetDocument), new { id = documentId }, model.Document);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // DELETE: api/Documents/5
        [HttpDelete("{id}")]
        public IActionResult DeleteDocument(int id)
        {
            try
            {
                bool deleted = _documentService.DeleteDocument(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"מסמך עם מזהה {id} לא נמצא");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
    }

    public class DocumentUploadModel
    {
        public Documentt Document { get; set; }
        public IFormFile File { get; set; }
    }
}
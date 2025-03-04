using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using System.Reflection.Metadata;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly DocumentService _documentService;

        public DocumentsController(IConfiguration configuration)
        {
            _documentService = new DocumentService(configuration);
        }

        // GET: api/Documents
        [HttpGet]
        public ActionResult<IEnumerable<Document>> GetDocuments()
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
        public ActionResult<Document> GetDocument(int id)
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
        public ActionResult<IEnumerable<Document>> GetDocumentsByKidId(int kidId)
        {
            try
            {
                return Ok(_documentService.GetDocumentsByKidId(kidId));
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

                // קביעת סוג התוכן לפי סיומת הקובץ
                string contentType = "application/octet-stream"; // ברירת מחדל
                string fileName = Path.GetFileName(document.DocPath);
                string extension = Path.GetExtension(fileName).ToLowerInvariant();

                switch (extension)
                {
                    case ".pdf":
                        contentType = "application/pdf";
                        break;
                    case ".jpg":
                    case ".jpeg":
                        contentType = "image/jpeg";
                        break;
                    case ".png":
                        contentType = "image/png";
                        break;
                    case ".gif":
                        contentType = "image/gif";
                        break;
                    case ".doc":
                        contentType = "application/msword";
                        break;
                    case ".docx":
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        break;
                    case ".xls":
                        contentType = "application/vnd.ms-excel";
                        break;
                    case ".xlsx":
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        break;
                    case ".txt":
                        contentType = "text/plain";
                        break;
                }

                return File(fileContent, contentType, fileName);
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

        // POST: api/Documents
        [HttpPost]
        public ActionResult<Document> PostDocument([FromForm] DocumentUploadModel model)
        {
            try
            {
                if (model.File == null || model.File.Length == 0)
                {
                    return BadRequest("לא נבחר קובץ");
                }

                // קריאת תוכן הקובץ
                byte[] fileContent;
                using (var ms = new MemoryStream())
                {
                    model.File.CopyTo(ms);
                    fileContent = ms.ToArray();
                }

                // הוספת המסמך
                int documentId = _documentService.AddDocument(model.Document, fileContent, model.File.FileName);
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

        // PUT: api/Documents/5
        [HttpPut("{id}")]
        public IActionResult PutDocument(int id, Document document)
        {
            if (id != document.DocId)
            {
                return BadRequest("מזהה המסמך בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _documentService.UpdateDocument(document);

                if (updated)
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
        public Document Document { get; set; }
        public IFormFile File { get; set; }
    }
}
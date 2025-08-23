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
    //[Authorize]
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

        [HttpGet("content-by-path")]
        public ActionResult GetDocumentContentByPath([FromQuery] string path)
        {
            try
            {
                if (string.IsNullOrEmpty(path))
                {
                    return BadRequest("נדרש נתיב למסמך");
                }

                // דיבוג
                var debugInfo = new
                {
                    ReceivedPath = path,
                    DecodedPath = Uri.UnescapeDataString(path),
                    UploadsBasePath = _uploadsBasePath,
                    FullPath = Path.Combine(_uploadsBasePath, Uri.UnescapeDataString(path).Replace("/", "\\")),
                    FileExists = (Path.Combine(_uploadsBasePath, Uri.UnescapeDataString(path).Replace("/", "\\")))
                };

                Console.WriteLine($"Debug Info: {System.Text.Json.JsonSerializer.Serialize(debugInfo)}");

                byte[] fileContent = _documentService.GetDocumentContentByPath(path);
                string contentType = GetContentTypeFromPath(path);
                return File(fileContent, contentType);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { error = ex.Message, path = path });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    path = path,
                    uploadsBase = _uploadsBasePath
                });
            }
        }

        [HttpGet("find-file")]
        public ActionResult FindFile([FromQuery] string fileName)
        {
            try
            {
                var results = new List<string>();

                // חפש בכל התיקיות
                if (Directory.Exists(_uploadsBasePath))
                {
                    var files = Directory.GetFiles(_uploadsBasePath, fileName, SearchOption.AllDirectories);
                    results.AddRange(files.Select(f => f.Replace(_uploadsBasePath, "UPLOADS_ROOT")));
                }

                return Ok(new
                {
                    SearchedFile = fileName,
                    Found = results.Count > 0,
                    Locations = results,
                    UploadsPath = _uploadsBasePath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpGet("list-all-images")]
        public ActionResult ListAllImages()
        {
            try
            {
                var allImages = new
                {
                    EmployeeImages = Directory.Exists(Path.Combine(_uploadsBasePath, "employees", "pictures"))
                        ? Directory.GetFiles(Path.Combine(_uploadsBasePath, "employees", "pictures"), "*.jpg")
                            .Concat(Directory.GetFiles(Path.Combine(_uploadsBasePath, "employees", "pictures"), "*.jpeg"))
                            .Concat(Directory.GetFiles(Path.Combine(_uploadsBasePath, "employees", "pictures"), "*.png"))
                            .Select(Path.GetFileName)
                            .ToList()
                        : new List<string>(),

                    KidsProfileImages = new List<object>()
                };

                // חפש תמונות בתיקיות הילדים
                var kidsPath = Path.Combine(_uploadsBasePath, "kids");
                if (Directory.Exists(kidsPath))
                {
                    foreach (var kidFolder in Directory.GetDirectories(kidsPath))
                    {
                        var profilePath = Path.Combine(kidFolder, "profile");
                        if (Directory.Exists(profilePath))
                        {
                            var images = Directory.GetFiles(profilePath)
                                .Select(f => new
                                {
                                    FolderName = Path.GetFileName(kidFolder),
                                    FileName = Path.GetFileName(f),
                                    RelativePath = $"kids/{Path.GetFileName(kidFolder)}/profile/{Path.GetFileName(f)}"
                                });
                            ((List<object>)allImages.KidsProfileImages).AddRange(images);
                        }
                    }
                }

                return Ok(allImages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("check-structure")]
        public ActionResult CheckFolderStructure()
        {
            try
            {
                var result = new
                {
                    UploadsPath = _uploadsBasePath,
                    UploadsExists = Directory.Exists(_uploadsBasePath),

                    // בדיקת תיקיית employees
                    EmployeesFolder = new
                    {
                        Path = Path.Combine(_uploadsBasePath, "employees"),
                        Exists = Directory.Exists(Path.Combine(_uploadsBasePath, "employees")),
                        SubFolders = Directory.Exists(Path.Combine(_uploadsBasePath, "employees"))
                            ? Directory.GetDirectories(Path.Combine(_uploadsBasePath, "employees")).Select(Path.GetFileName)
                            : null,
                        PicturesFolder = Directory.Exists(Path.Combine(_uploadsBasePath, "employees", "pictures")),
                        PictureFiles = Directory.Exists(Path.Combine(_uploadsBasePath, "employees", "pictures"))
                            ? Directory.GetFiles(Path.Combine(_uploadsBasePath, "employees", "pictures")).Take(5).Select(Path.GetFileName)
                            : null
                    },

                    // בדיקת תיקיית kids
                    KidsFolder = new
                    {
                        Path = Path.Combine(_uploadsBasePath, "kids"),
                        Exists = Directory.Exists(Path.Combine(_uploadsBasePath, "kids")),
                        SubFolders = Directory.Exists(Path.Combine(_uploadsBasePath, "kids"))
                            ? Directory.GetDirectories(Path.Combine(_uploadsBasePath, "kids")).Take(5).Select(Path.GetFileName)
                            : null
                    },

                    // כל הקבצים והתיקיות ישירות תחת uploads
                    RootContents = Directory.Exists(_uploadsBasePath)
                        ? new
                        {
                            Folders = Directory.GetDirectories(_uploadsBasePath).Select(Path.GetFileName),
                            Files = Directory.GetFiles(_uploadsBasePath).Select(Path.GetFileName)
                        }
                        : null
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
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
                // Retrieve the document
                var document = _documentService.GetDocumentById(id);
                if (document == null)
                {
                    return NotFound($"מסמך עם מזהה {id} לא נמצא");
                }

                // Retrieve the document content
                byte[] fileContent = _documentService.GetDocumentContent(id);

                // Set the download with the appropriate content type
                return File(
                    fileContent,
                    document.ContentType ?? "application/octet-stream",
                    document.DocName ?? $"document_{id}",
                    true // Add parameter to specify as file for download
                );
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
                return StatusCode(500, $"שגיאה בשרת: {ex.Message}");
            }
        }

        // In DocumentsController
        //[HttpGet("content-by-path")]
        //public ActionResult GetDocumentContentByPath([FromQuery] string path)
        //{
        //    Console.WriteLine(path);
        //    try
        //    {
        //        if (string.IsNullOrEmpty(path))
        //        {
        //            return BadRequest("נדרש נתיב למסמך");
        //        }

        //        byte[] fileContent = _documentService.GetDocumentContentByPath(path);

        //        string contentType = GetContentTypeFromPath(path);

        //        return File(fileContent, contentType);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ex.Message);
        //    }
        //}

        // POST: api/Documents/upload
        [HttpPost("upload")]
        public ActionResult<Documentt> UploadDocument([FromForm] DocumentUploadModel model)
        {
            try
            {
                // Validation checks
                if (model.File == null || model.File.Length == 0)
                {
                    return BadRequest("לא נבחר קובץ או שהקובץ ריק");
                }

                if (model.Document == null)
                {
                    return BadRequest("לא סופק מידע על המסמך");
                }

                if (!model.Document.KidId.HasValue && !model.Document.EmployeeId.HasValue)
                {
                    return BadRequest("חובה לקשר את המסמך לילד או לעובד");
                }

                // Read the file content
                byte[] fileContent;
                using (var ms = new MemoryStream())
                {
                    model.File.CopyTo(ms);
                    fileContent = ms.ToArray();
                }

                // Add the document
                int documentId = _documentService.AddDocument(
                    model.Document,
                    fileContent,
                    Path.GetFileName(model.File.FileName), // Ensure only filename is used without path
                    model.File.ContentType
                );

                // Retrieve the full document after saving
                var savedDocument = _documentService.GetDocumentById(documentId);

                return CreatedAtAction(nameof(GetDocument), new { id = documentId }, savedDocument);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (IOException ex)
            {
                return StatusCode(500, $"שגיאה בשמירת הקובץ: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשרת: {ex.Message}");
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

        // Helper function to determine content type based on file extension
        private string GetContentTypeFromPath(string path)
        {
            string extension = Path.GetExtension(path).ToLower();

            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }

    public class DocumentUploadModel
    {
        public Documentt Document { get; set; }
        public IFormFile File { get; set; }
    }
}

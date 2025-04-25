using System;
using System.Collections.Generic;
using System.IO;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class DocumentService
    {
        private readonly DocumentRepository _documentRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly string _uploadsBasePath;

        public DocumentService(IConfiguration configuration)
        {
            _documentRepository = new DocumentRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);

            // קבלת נתיב הבסיס לשמירת קבצים מהקונפיגורציה
            _uploadsBasePath = configuration.GetValue<string>("UploadsBasePath") ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");

            // יצירת תיקיית הבסיס ותת-תיקיות אם אינן קיימות
            EnsureDirectoriesExist();
        }

        private void EnsureDirectoriesExist()
        {
            try
            {
                // יצירת תיקיית הבסיס
                if (!Directory.Exists(_uploadsBasePath))
                {
                    Directory.CreateDirectory(_uploadsBasePath);
                }

                // יצירת תת-תיקיות
                string[] subFolders = new[] {
            "employees/pictures",
            "employees/documents",
            "kids/pictures",
            "kids/documents"
        };

                foreach (var subFolder in subFolders)
                {
                    string path = Path.Combine(_uploadsBasePath, subFolder.Replace("/", Path.DirectorySeparatorChar.ToString()));
                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"שגיאה ביצירת תיקיות: {ex.Message}");
                throw new DirectoryNotFoundException($"לא ניתן ליצור את תיקיית המסמכים: {ex.Message}");
            }
        }
        public List<Documentt> GetAllDocuments()
        {
            return _documentRepository.GetAllDocuments();
        }

        public Documentt GetDocumentById(int id)
        {
            return _documentRepository.GetDocumentById(id);
        }

        public List<Documentt> GetDocumentsByKidId(int kidId)
        {
            // וידוא שהילד קיים
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException($"ילד עם מזהה {kidId} לא נמצא במערכת");
            }

            return _documentRepository.GetDocumentsByKidId(kidId);
        }

        public List<Documentt> GetDocumentsByEmployeeId(int employeeId)
        {
            // וידוא שהעובד קיים
            Employee employee = _employeeRepository.GetEmployeeById(employeeId);
            if (employee == null)
            {
                throw new ArgumentException($"עובד עם מזהה {employeeId} לא נמצא במערכת");
            }

            return _documentRepository.GetDocumentsByEmployeeId(employeeId);
        }

        public int AddDocument(Documentt document, byte[] fileContent, string fileName, string contentType)
        {
            // וידוא שיש לפחות מזהה אחד (ילד או עובד)
            if (!document.KidId.HasValue && !document.EmployeeId.HasValue)
            {
                throw new ArgumentException("יש לקשר את המסמך לילד או לעובד");
            }

            // וידוא שהילד קיים (אם המסמך משויך לילד)
            if (document.KidId.HasValue)
            {
                Kid kid = _kidRepository.GetKidById(document.KidId.Value);
                if (kid == null)
                {
                    throw new ArgumentException($"ילד עם מזהה {document.KidId} לא נמצא במערכת");
                }
            }

            // וידוא שהעובד קיים (אם המסמך משויך לעובד)
            if (document.EmployeeId.HasValue)
            {
                Employee employee = _employeeRepository.GetEmployeeById(document.EmployeeId.Value);
                if (employee == null)
                {
                    throw new ArgumentException($"עובד עם מזהה {document.EmployeeId} לא נמצא במערכת");
                }
            }

            // הגדרת מידע נוסף על המסמך
            document.DocName = fileName;
            document.ContentType = contentType;
            document.FileSize = fileContent.Length;
            document.UploadDate = DateTime.Now;

            // קביעת התיקייה לשמירת הקובץ בהתאם לסוג המסמך
            string subFolder;
            string docTypeNormalized = (document.DocType ?? "").ToLower().Trim();

            if (document.KidId.HasValue)
            {
                subFolder = docTypeNormalized == "picture" || docTypeNormalized == "profile" ?
                    Path.Combine("kids", "pictures") :
                    Path.Combine("kids", "documents");
            }
            else
            {
                subFolder = docTypeNormalized == "picture" || docTypeNormalized == "profile" ?
                    Path.Combine("employees", "pictures") :
                    Path.Combine("employees", "documents");
            }

            // יצירת שם קובץ ייחודי
            string fileExtension = Path.GetExtension(fileName);
            string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            // המרה לשימוש ב-Path.Combine במקום חיבור ידני של נתיבים
            string relativePath = Path.Combine(subFolder, uniqueFileName).Replace("\\", "/");
            string fullPath = Path.Combine(_uploadsBasePath, subFolder, uniqueFileName);

            try
            {
                // וידוא שהתיקייה קיימת
                string directoryPath = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // שמירת הקובץ
                File.WriteAllBytes(fullPath, fileContent);

                // הגדרת נתיב יחסי במסמך
                document.DocPath = relativePath;
                document.DocName = fileName;
                document.ContentType = contentType ?? "application/octet-stream";
                document.FileSize = fileContent.Length;
                document.UploadDate = DateTime.Now;

                // שמירת המסמך במסד הנתונים
                return _documentRepository.AddDocument(document);
            }
            catch (Exception ex)
            {
                throw new IOException($"שגיאה בשמירת הקובץ: {ex.Message}", ex);
            }
        }


        public bool UpdateDocument(Documentt document)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(document.DocId);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {document.DocId} לא נמצא במערכת");
            }

            // אין לשנות את הנתיב - רק מידע אחר
            document.DocPath = existingDocument.DocPath;

            // עדכון המסמך
            return _documentRepository.UpdateDocument(document);
        }

        public bool DeleteDocument(int id)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {id} לא נמצא במערכת");
            }

            // מחיקת הקובץ אם קיים
            string fullPath = Path.Combine(_uploadsBasePath, existingDocument.DocPath.Replace("/", "\\"));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            // מחיקת המסמך ממסד הנתונים
            return _documentRepository.DeleteDocument(id);
        }

        public byte[] GetDocumentContentByPath(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                throw new ArgumentException("נתיב לא יכול להיות ריק");
            }

            // פענוח URL אם צריך
            path = Uri.UnescapeDataString(path);

            // החלפת / ב-\ (במערכת Windows) או להיפך (במערכת Linux)
            string normalizedPath = path.Replace("/", Path.DirectorySeparatorChar.ToString());

            // יצירת הנתיב המלא
            string fullPath = Path.Combine(_uploadsBasePath, normalizedPath);
            Console.WriteLine(fullPath);
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"הקובץ לא נמצא: {fullPath}");
            }

            return File.ReadAllBytes(fullPath);
        }
        public byte[] GetDocumentContent(int id)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {id} לא נמצא במערכת");
            }

            // קריאת תוכן הקובץ
            string normalizePath = existingDocument.DocPath.Replace("/", Path.DirectorySeparatorChar.ToString());
            string fullPath = Path.Combine(_uploadsBasePath, normalizePath);

            if (File.Exists(fullPath))
            {
                try
                {
                    return File.ReadAllBytes(fullPath);
                }
                catch (Exception ex)
                {
                    throw new IOException($"שגיאה בקריאת הקובץ: {ex.Message}", ex);
                }
            }
            else
            {
                throw new FileNotFoundException($"הקובץ '{existingDocument.DocName}' לא נמצא בנתיב: {fullPath}");
            }
        }
    }
}
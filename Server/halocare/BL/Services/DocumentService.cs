// DocumentService - הוספת תמיכה ליצירת תיקיות ילד ועדכון נתיב תמונה

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
            _uploadsBasePath = configuration.GetValue<string>("UploadsBasePath") ??
                               Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");
        }

        // פונקציה חדשה ליצירת מבנה תיקיות לילד
        public string CreateKidFolderStructure(int kidId, string firstName, string lastName)
        {
            try
            {
                // יצירת שם תיקייה: FirstName_LastName_ID
                string folderName = $"{firstName}_{lastName}_{kidId}";

                // נתיב התיקייה הראשית של הילד
                string kidMainFolder = Path.Combine(_uploadsBasePath, "kids", folderName);

                // יצירת התיקייה הראשית
                if (!Directory.Exists(kidMainFolder))
                {
                    Directory.CreateDirectory(kidMainFolder);
                }

                // יצירת תת-תיקיות
                string profileFolder = Path.Combine(kidMainFolder, "profile");
                string documentsFolder = Path.Combine(kidMainFolder, "documents");

                if (!Directory.Exists(profileFolder))
                {
                    Directory.CreateDirectory(profileFolder);
                }

                if (!Directory.Exists(documentsFolder))
                {
                    Directory.CreateDirectory(documentsFolder);
                }

                // החזרת הנתיב היחסי לתיקייה (ללא uploads base path)
                return Path.Combine("kids", folderName).Replace("\\", "/");
            }
            catch (Exception ex)
            {
                throw new IOException($"שגיאה ביצירת מבנה תיקיות לילד: {ex.Message}", ex);
            }
        }

        // פונקציה מעודכנת להעלאת מסמך עם תמיכה בילדים
        public int AddDocument(Documentt document, byte[] fileContent, string fileName, string contentType)
        {
            try
            {
                // בדיקות תקינות
                if (document == null)
                {
                    throw new ArgumentException("נתוני המסמך לא יכולים להיות ריקים");
                }

                if (fileContent == null || fileContent.Length == 0)
                {
                    throw new ArgumentException("תוכן הקובץ לא יכול להיות ריק");
                }

                if (!document.KidId.HasValue && !document.EmployeeId.HasValue)
                {
                    throw new ArgumentException("חובה לקשר את המסמך לילד או לעובד");
                }

                string relativePath;
                string fullPath;

                // טיפול בהעלאה עבור ילד
                if (document.KidId.HasValue)
                {
                    // קבלת פרטי הילד
                    Kid kid = _kidRepository.GetKidById(document.KidId.Value);
                    if (kid == null)
                    {
                        throw new ArgumentException($"ילד עם מזהה {document.KidId.Value} לא נמצא במערכת");
                    }

                    // יצירת מבנה תיקיות אם לא קיים
                    string kidFolderPath;
                    if (string.IsNullOrEmpty(kid.PathToFolder))
                    {
                        kidFolderPath = CreateKidFolderStructure(kid.Id, kid.FirstName, kid.LastName);

                        // עדכון שדה PathToFolder בטבלת הילד
                        kid.PathToFolder = kidFolderPath;
                        _kidRepository.UpdateKid(kid);
                    }
                    else
                    {
                        kidFolderPath = kid.PathToFolder;
                    }

                    // קביעת תיקיית יעד בהתאם לסוג המסמך
                    string targetFolder = document.DocType == "profile" ? "profile" : "documents";

                    // יצירת שם קובץ ייחודי
                    string fileExtension = Path.GetExtension(fileName);
                    string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                    // נתיב יחסי (לשמירה במסד הנתונים)
                    relativePath = Path.Combine(kidFolderPath, targetFolder, uniqueFileName).Replace("\\", "/");

                    // נתיב מלא לשמירת הקובץ
                    fullPath = Path.Combine(_uploadsBasePath, relativePath.Replace("/", "\\"));
                }
                // טיפול בהעלאה עבור עובד (הקוד הקיים)
                else if (document.EmployeeId.HasValue)
                {
                    // קבלת פרטי העובד
                    Employee employee = _employeeRepository.GetEmployeeById(document.EmployeeId.Value);
                    if (employee == null)
                    {
                        throw new ArgumentException($"עובד עם מזהה {document.EmployeeId.Value} לא נמצא במערכת");
                    }

                    // יצירת תיקיית עובדים אם לא קיימת
                    string employeesFolder = Path.Combine(_uploadsBasePath, "employees");
                    if (!Directory.Exists(employeesFolder))
                    {
                        Directory.CreateDirectory(employeesFolder);
                    }

                    // תיקיית תמונות עובדים
                    string targetFolder = document.DocType == "profile" ? "pictures" : "documents";
                    string employeeTargetFolder = Path.Combine(employeesFolder, targetFolder);

                    if (!Directory.Exists(employeeTargetFolder))
                    {
                        Directory.CreateDirectory(employeeTargetFolder);
                    }

                    // יצירת שם קובץ ייחודי
                    string fileExtension = Path.GetExtension(fileName);
                    string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                    // נתיב יחסי
                    relativePath = Path.Combine("employees", targetFolder, uniqueFileName).Replace("\\", "/");

                    // נתיב מלא
                    fullPath = Path.Combine(_uploadsBasePath, relativePath.Replace("/", "\\"));
                }
                else
                {
                    throw new ArgumentException("חובה לקשר את המסמך לילד או לעובד");
                }

                // וידוא שהתיקייה קיימת
                string directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // שמירת הקובץ
                File.WriteAllBytes(fullPath, fileContent);

                // עדכון פרטי המסמך
                document.DocPath = relativePath;
                document.DocName = fileName;
                document.ContentType = contentType ?? "application/octet-stream";
                document.FileSize = fileContent.Length;
                document.UploadDate = DateTime.Now;

                // שמירת המסמך במסד הנתונים
                int documentId = _documentRepository.AddDocument(document);

                // עדכון שדה התמונה בטבלת הילד או העובד (אם מדובר בתמונת פרופיל)
                if (document.DocType == "profile")
                {
                    if (document.KidId.HasValue)
                    {
                        Kid kid = _kidRepository.GetKidById(document.KidId.Value);
                        kid.PhotoPath = relativePath;
                        _kidRepository.UpdateKid(kid);
                    }
                    else if (document.EmployeeId.HasValue)
                    {
                        Employee employee = _employeeRepository.GetEmployeeById(document.EmployeeId.Value);
                        employee.Photo = relativePath;
                        _employeeRepository.UpdateEmployee(employee);
                    }
                }

                return documentId;
            }
            catch (Exception ex)
            {
                throw new IOException($"שגיאה בשמירת הקובץ: {ex.Message}", ex);
            }
        }

        // שאר הפונקציות הקיימות נשארות כמו שהן...
        public List<Documentt> GetAllDocuments()
        {
            return _documentRepository.GetAllDocuments();
        }

        public List<Documentt> GetDocumentsByKidId(int kidId)
        {
            // וידוא שהילד קיים
            Kid existingKid = _kidRepository.GetKidById(kidId);
            if (existingKid == null)
            {
                throw new ArgumentException($"ילד עם מזהה {kidId} לא נמצא במערכת");
            }

            return _documentRepository.GetDocumentsByKidId(kidId);
        }

        public List<Documentt> GetDocumentsByEmployeeId(int employeeId)
        {
            // וידוא שהעובד קיים
            Employee existingEmployee = _employeeRepository.GetEmployeeById(employeeId);
            if (existingEmployee == null)
            {
                throw new ArgumentException($"עובד עם מזהה {employeeId} לא נמצא במערכת");
            }

            return _documentRepository.GetDocumentsByEmployeeId(employeeId);
        }

        public Documentt GetDocumentById(int id)
        {
            return _documentRepository.GetDocumentById(id);
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
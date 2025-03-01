using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection.Metadata;
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
        private readonly string _documentsBasePath;

        public DocumentService(IConfiguration configuration)
        {
            _documentRepository = new DocumentRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);

            // קבלת נתיב הבסיס לשמירת מסמכים מהקונפיגורציה
            _documentsBasePath = configuration.GetValue<string>("DocumentsBasePath") ?? "Documents";

            // יצירת תיקיית הבסיס אם אינה קיימת
            if (!Directory.Exists(_documentsBasePath))
            {
                Directory.CreateDirectory(_documentsBasePath);
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
            return _documentRepository.GetDocumentsByKidId(kidId);
        }

        public int AddDocument(Documentt document, byte[] fileContent, string fileName)
        {
            // וידוא שהילד קיים
            Kid kid = _kidRepository.GetKidById(document.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // וידוא שהעובד קיים
            Employee employee = _employeeRepository.GetEmployeeById(document.EmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }

            // הגדרת תאריך העלאת המסמך
            document.UploadDate = DateTime.Now;

            // יצירת תיקייה לילד אם אינה קיימת
            string kidFolderPath = Path.Combine(_documentsBasePath, document.KidId.ToString());
            if (!Directory.Exists(kidFolderPath))
            {
                Directory.CreateDirectory(kidFolderPath);
            }

            // יצירת שם קובץ ייחודי
            string uniqueFileName = $"{DateTime.Now:yyyyMMddHHmmss}_{fileName}";
            string filePath = Path.Combine(kidFolderPath, uniqueFileName);

            // שמירת הקובץ
            File.WriteAllBytes(filePath, fileContent);

            // הגדרת נתיב המסמך
            document.DocPath = filePath;

            // שמירת המסמך במסד הנתונים
            return _documentRepository.AddDocument(document);
        }

        public bool UpdateDocument(Documentt document)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(document.DocId);
            if (existingDocument == null)
            {
                throw new ArgumentException("המסמך לא נמצא במערכת");
            }

            // עדכון המסמך
            return _documentRepository.UpdateDocument(document);
        }

        public bool DeleteDocument(int id)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException("המסמך לא נמצא במערכת");
            }

            // מחיקת הקובץ אם קיים
            if (File.Exists(existingDocument.DocPath))
            {
                File.Delete(existingDocument.DocPath);
            }

            // מחיקת המסמך ממסד הנתונים
            return _documentRepository.DeleteDocument(id);
        }

        public byte[] GetDocumentContent(int id)
        {
            // וידוא שהמסמך קיים
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException("המסמך לא נמצא במערכת");
            }

            // קריאת תוכן הקובץ
            if (File.Exists(existingDocument.DocPath))
            {
                return File.ReadAllBytes(existingDocument.DocPath);
            }
            else
            {
                throw new FileNotFoundException("הקובץ לא נמצא במערכת", existingDocument.DocPath);
            }
        }
    }
}
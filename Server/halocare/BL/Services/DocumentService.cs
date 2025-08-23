// DocumentService - Adding support for creating kid folders and updating image paths

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

            //Get base path for saving files from configuration
           _uploadsBasePath = configuration.GetValue<string>("UploadsBasePath") ??
                       Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        }

        // New function to create folder structure for a kid
        public string CreateKidFolderStructure(int kidId, string firstName, string lastName)
        {
            try
            {
                // Create folder name: FirstName_LastName_ID
                string folderName = $"{firstName}_{lastName}_{kidId}";

                // Path to kid's main folder
                string kidMainFolder = Path.Combine(_uploadsBasePath, "kids", folderName);

                // Create main folder
                if (!Directory.Exists(kidMainFolder))
                {
                    Directory.CreateDirectory(kidMainFolder);
                }

                // Create subfolders
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

                // Return relative path to folder (without uploads base path)
                return Path.Combine("kids", folderName).Replace("\\", "/");
            }
            catch (Exception ex)
            {
                throw new IOException($"שגיאה ביצירת מבנה תיקיות לילד: {ex.Message}", ex);
            }
        }

        // Updated function for uploading document with kid support
        public int AddDocument(Documentt document, byte[] fileContent, string fileName, string contentType)
        {
            try
            {
                // Validation checks
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

                // Handling upload for kid
                if (document.KidId.HasValue)
                {
                    // Get kid details
                    Kid kid = _kidRepository.GetKidById(document.KidId.Value);
                    if (kid == null)
                    {
                        throw new ArgumentException($"ילד עם מזהה {document.KidId.Value} לא נמצא במערכת");
                    }

                    // Create folder structure if not exists
                    string kidFolderPath;
                    if (string.IsNullOrEmpty(kid.PathToFolder))
                    {
                        kidFolderPath = CreateKidFolderStructure(kid.Id, kid.FirstName, kid.LastName);

                        // Update PathToFolder field in kid table
                        kid.PathToFolder = kidFolderPath;
                        _kidRepository.UpdateKid(kid);
                    }
                    else
                    {
                        kidFolderPath = kid.PathToFolder;
                    }

                    // Set target folder according to document type
                    string targetFolder = document.DocType == "profile" ? "profile" : "documents";

                    // Create unique file name
                    string fileExtension = Path.GetExtension(fileName);
                    string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                    // Relative path (to save in DB)
                    relativePath = Path.Combine(kidFolderPath, targetFolder, uniqueFileName).Replace("\\", "/");

                    // Full path to save the file
                    fullPath = Path.Combine(_uploadsBasePath, relativePath.Replace("/", "\\"));
                }
                // Handling upload for employee (existing code)
                else if (document.EmployeeId.HasValue)
                {
                    // Get employee details
                    Employee employee = _employeeRepository.GetEmployeeById(document.EmployeeId.Value);
                    if (employee == null)
                    {
                        throw new ArgumentException($"עובד עם מזהה {document.EmployeeId.Value} לא נמצא במערכת");
                    }

                    // Create employees folder if not exists
                    string employeesFolder = Path.Combine(_uploadsBasePath, "employees");
                    if (!Directory.Exists(employeesFolder))
                    {
                        Directory.CreateDirectory(employeesFolder);
                    }

                    // Employee pictures folder
                    string targetFolder = document.DocType == "profile" ? "pictures" : "documents";
                    string employeeTargetFolder = Path.Combine(employeesFolder, targetFolder);

                    if (!Directory.Exists(employeeTargetFolder))
                    {
                        Directory.CreateDirectory(employeeTargetFolder);
                    }

                    // Create unique file name
                    string fileExtension = Path.GetExtension(fileName);
                    string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                    // Relative path
                    relativePath = Path.Combine("employees", targetFolder, uniqueFileName).Replace("\\", "/");

                    // Full path
                    fullPath = Path.Combine(_uploadsBasePath, relativePath.Replace("/", "\\"));
                }
                else
                {
                    throw new ArgumentException("חובה לקשר את המסמך לילד או לעובד");
                }

                // Ensure directory exists
                string directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Save file
                File.WriteAllBytes(fullPath, fileContent);

                // Update document details
                document.DocPath = relativePath;
                document.DocName = fileName;
                document.ContentType = contentType ?? "application/octet-stream";
                document.FileSize = fileContent.Length;
                document.UploadDate = DateTime.Now;

                // Save document in DB
                int documentId = _documentRepository.AddDocument(document);

                // Update photo field in kid or employee table if it's a profile picture
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

        // Other existing functions remain as is...
        public List<Documentt> GetAllDocuments()
        {
            return _documentRepository.GetAllDocuments();
        }

        public List<Documentt> GetDocumentsByKidId(int kidId)
        {
            // Ensure the kid exists
            Kid existingKid = _kidRepository.GetKidById(kidId);
            if (existingKid == null)
            {
                throw new ArgumentException($"ילד עם מזהה {kidId} לא נמצא במערכת");
            }

            return _documentRepository.GetDocumentsByKidId(kidId);
        }

        public List<Documentt> GetDocumentsByEmployeeId(int employeeId)
        {
            // Ensure the employee exists
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
            // Ensure the document exists
            Documentt existingDocument = _documentRepository.GetDocumentById(document.DocId);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {document.DocId} לא נמצא במערכת");
            }

            // Do not change the path - only other info
            document.DocPath = existingDocument.DocPath;

            // Update document
            return _documentRepository.UpdateDocument(document);
        }

        public bool DeleteDocument(int id)
        {
            // Ensure the document exists
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {id} לא נמצא במערכת");
            }

            // Delete the file if exists
            string fullPath = Path.Combine(_uploadsBasePath, existingDocument.DocPath.Replace("/", "\\"));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            // Delete the document from DB
            return _documentRepository.DeleteDocument(id);
        }

        //public byte[] GetDocumentContentByPath(string path)
        //{
        //    if (string.IsNullOrEmpty(path))
        //    {
        //        throw new ArgumentException("נתיב לא יכול להיות ריק");
        //    }

        //    // Decode URL if needed
        //    path = Uri.UnescapeDataString(path);

        //    // Replace / with \ (Windows) or vice versa (Linux)
        //    string normalizedPath = path.Replace("/", Path.DirectorySeparatorChar.ToString());

        //    // Create full path
        //    string fullPath = Path.Combine(_uploadsBasePath, normalizedPath);

        //    if (!File.Exists(fullPath))
        //    {
        //        throw new FileNotFoundException($"הקובץ לא נמצא: {fullPath}");
        //    }

        //    return File.ReadAllBytes(fullPath);
        //}
        public byte[] GetDocumentContentByPath(string path)
        {
            try
            {
                if (string.IsNullOrEmpty(path))
                {
                    throw new ArgumentException("נתיב לא יכול להיות ריק");
                }

                // Decode URL if needed
                path = Uri.UnescapeDataString(path);

                // לוג לדיבוג
                Console.WriteLine($"Original path: {path}");
                Console.WriteLine($"_uploadsBasePath: {_uploadsBasePath}");

                // Replace / with \ (Windows)
                string normalizedPath = path.Replace("/", Path.DirectorySeparatorChar.ToString());
                Console.WriteLine($"Normalized path: {normalizedPath}");

                // Create full path
                string fullPath = Path.Combine(_uploadsBasePath, normalizedPath);
                Console.WriteLine($"Full path: {fullPath}");
                Console.WriteLine($"File exists: {File.Exists(fullPath)}");

                if (!File.Exists(fullPath))
                {
                    // נסה לראות אם יש בעיה עם encoding
                    var alternativePath = Path.Combine(_uploadsBasePath, path);
                    Console.WriteLine($"Alternative path: {alternativePath}");
                    Console.WriteLine($"Alternative exists: {File.Exists(alternativePath)}");

                    throw new FileNotFoundException($"הקובץ לא נמצא: {normalizedPath}");
                }

                return File.ReadAllBytes(fullPath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetDocumentContentByPath: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw new Exception($"שגיאה בטעינת הקובץ: {ex.Message}", ex);
            }
        }

        public byte[] GetDocumentContent(int id)
        {
            // Ensure the document exists
            Documentt existingDocument = _documentRepository.GetDocumentById(id);
            if (existingDocument == null)
            {
                throw new ArgumentException($"מסמך עם מזהה {id} לא נמצא במערכת");
            }

            // Read file content
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

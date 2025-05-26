// BL/Services/KidIntakeProcessService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace halocare.BL.Services
{
    public class KidIntakeProcessService
    {
        private readonly KidIntakeProcessRepository _processRepository;
        private readonly FormRepository _formRepository;
        private readonly KidRepository _kidRepository;

        public KidIntakeProcessService(IConfiguration configuration)
        {
            _processRepository = new KidIntakeProcessRepository(configuration);
            _formRepository = new FormRepository(configuration);
            _kidRepository = new KidRepository(configuration);
        }

        public List<KidIntakeProcess> GetAllKidIntakeProcesses()
        {
            return _processRepository.GetAllKidIntakeProcesses();
        }

        public KidIntakeProcess GetKidIntakeProcess(int kidId)
        {
            return _processRepository.GetKidIntakeProcessByKidId(kidId);
        }

        public int StartIntakeProcess(int kidId)
        {
            // בדיקה שהילד קיים
            Kid existingKid = _kidRepository.GetKidById(kidId);
            if (existingKid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // בדיקה שאין כבר תהליך קליטה פעיל
            KidIntakeProcess existingProcess = _processRepository.GetKidIntakeProcessByKidId(kidId);
            if (existingProcess != null)
            {
                throw new ArgumentException("תהליך קליטה כבר קיים עבור ילד זה");
            }

            // יצירת רשימת כל הטפסים הנדרשים
            List<Form> allForms = _formRepository.GetAllForms();
            List<int> pendingFormIds = allForms.Select(f => f.FormId).ToList();

            KidIntakeProcess newProcess = new KidIntakeProcess
            {
                KidId = kidId,
                Status = "IN_PROGRESS",
                CurrentFormId = pendingFormIds.FirstOrDefault(),
                CompletedForms = "[]",
                PendingForms = JsonConvert.SerializeObject(pendingFormIds),
                ParentPendingForms = "[]",
                CompletionPercentage = 0,
                Notes = ""
            };

            return _processRepository.AddKidIntakeProcess(newProcess);
        }

        public bool CompleteFormStep(int kidId, int formId)
        {
            KidIntakeProcess process = _processRepository.GetKidIntakeProcessByKidId(kidId);
            if (process == null)
            {
                throw new ArgumentException("תהליך קליטה לא נמצא");
            }

            // עדכון הרשימות
            List<int> completedForms = JsonConvert.DeserializeObject<List<int>>(process.CompletedForms ?? "[]");
            List<int> pendingForms = JsonConvert.DeserializeObject<List<int>>(process.PendingForms ?? "[]");

            if (!completedForms.Contains(formId))
            {
                completedForms.Add(formId);
            }

            pendingForms.Remove(formId);

            // חישוב אחוז השלמה
            List<Form> allForms = _formRepository.GetAllForms();
            int totalForms = allForms.Count;
            int completionPercentage = (int)Math.Round((double)completedForms.Count / totalForms * 100);

            // עדכון הטופס הנוכחי
            int? nextFormId = pendingForms.FirstOrDefault();
            if (nextFormId == 0) nextFormId = null;

            // עדכון הסטטוס
            string newStatus = pendingForms.Count == 0 ? "COMPLETED" : "IN_PROGRESS";

            process.CompletedForms = JsonConvert.SerializeObject(completedForms);
            process.PendingForms = JsonConvert.SerializeObject(pendingForms);
            process.CurrentFormId = nextFormId;
            process.CompletionPercentage = completionPercentage;
            process.Status = newStatus;

            return _processRepository.UpdateKidIntakeProcess(process);
        }

        public bool SendFormToParents(int kidId, int formId)
        {
            KidIntakeProcess process = _processRepository.GetKidIntakeProcessByKidId(kidId);
            if (process == null)
            {
                throw new ArgumentException("תהליך קליטה לא נמצא");
            }

            List<int> parentPendingForms = JsonConvert.DeserializeObject<List<int>>(process.ParentPendingForms ?? "[]");

            if (!parentPendingForms.Contains(formId))
            {
                parentPendingForms.Add(formId);
            }

            process.ParentPendingForms = JsonConvert.SerializeObject(parentPendingForms);
            process.Status = "PENDING_PARENTS";

            return _processRepository.UpdateKidIntakeProcess(process);
        }

        public bool UpdateProcessStatus(int kidId, string status)
        {
            // בדיקת תקינות הסטטוס
            List<string> validStatuses = new List<string>
            { "NOT_STARTED", "IN_PROGRESS", "PENDING_PARENTS", "COMPLETED", "PAUSED" };

            if (!validStatuses.Contains(status))
            {
                throw new ArgumentException("סטטוס לא תקין");
            }

            return _processRepository.UpdateIntakeProcessStatus(kidId, status);
        }

        public bool UpdateProcessNotes(int kidId, string notes)
        {
            KidIntakeProcess process = _processRepository.GetKidIntakeProcessByKidId(kidId);
            if (process == null)
            {
                throw new ArgumentException("תהליך קליטה לא נמצא");
            }

            process.Notes = notes;
            return _processRepository.UpdateKidIntakeProcess(process);
        }

        public bool DeleteIntakeProcess(int kidId)
        {
            KidIntakeProcess process = _processRepository.GetKidIntakeProcessByKidId(kidId);
            if (process == null)
            {
                throw new ArgumentException("תהליך קליטה לא נמצא");
            }

            return _processRepository.DeleteKidIntakeProcess(process.Id);
        }
    }
}
using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class TSHAService
    {
        private readonly TSHARepository _tshaRepository;
        private readonly KidRepository _kidRepository;
        private readonly TreatmentRepository _treatmentRepository;

        public TSHAService(IConfiguration configuration)
        {
            _tshaRepository = new TSHARepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _treatmentRepository = new TreatmentRepository(configuration);
        }

        public List<TSHA> GetAllTSHAs()
        {
            return _tshaRepository.GetAllTSHAs();
        }

        public TSHA GetTSHAById(int id)
        {
            return _tshaRepository.GetTSHAById(id);
        }

        public List<TSHA> GetTSHAsByKidId(int kidId)
        {
            return _tshaRepository.GetTSHAsByKidId(kidId);
        }

        public int AddTSHA(TSHA tsha)
        {
            // וידוא שהילד קיים ופעיל
            Kid kid = _kidRepository.GetKidById(tsha.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור תש\"ה לילד שאינו פעיל");
            }

            // וידוא שהסטטוס תקין
            if (tsha.Status != "טיוטה" && tsha.Status != "פעיל" && tsha.Status != "הושלם")
            {
                throw new ArgumentException("סטטוס התש\"ה אינו תקין");
            }

            // הגדרת תאריך יצירת התש"ה
            if (tsha.CreationDate == DateTime.MinValue)
            {
                tsha.CreationDate = DateTime.Now;
            }

            return _tshaRepository.AddTSHA(tsha);
        }

        public bool UpdateTSHA(TSHA tsha)
        {
            // וידוא שהתש"ה קיים
            TSHA existingTSHA = _tshaRepository.GetTSHAById(tsha.TshaId);
            if (existingTSHA == null)
            {
                throw new ArgumentException("התש\"ה לא נמצא במערכת");
            }

            // וידוא שהסטטוס תקין
            if (tsha.Status != "טיוטה" && tsha.Status != "פעיל" && tsha.Status != "הושלם")
            {
                throw new ArgumentException("סטטוס התש\"ה אינו תקין");
            }

            return _tshaRepository.UpdateTSHA(tsha);
        }

        public TSHA GenerateTSHAReport(int kidId)
        {
            // וידוא שהילד קיים
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // קבלת הטיפולים של הילד
            List<Treatment> treatments = _treatmentRepository.GetTreatmentsByKidId(kidId);

            // יצירת תש"ה חדש
            TSHA tsha = new TSHA
            {
                KidId = kidId,
                CreationDate = DateTime.Now,
                Period = $"{DateTime.Now.Month}/{DateTime.Now.Year}",
                Status = "טיוטה",
                Goals = ""
            };

            // ניתוח הטיפולים ויצירת יעדים
            if (treatments.Count > 0)
            {
                // מיון הטיפולים לפי תאריך, מהחדש לישן
                treatments.Sort((a, b) => b.TreatmentDate.CompareTo(a.TreatmentDate));

                // איסוף נקודות חשובות מהטיפולים האחרונים
                List<string> highlights = new List<string>();
                foreach (Treatment treatment in treatments)
                {
                    if (!string.IsNullOrEmpty(treatment.Highlight))
                    {
                        highlights.Add($"[{treatment.TreatmentType}] {treatment.Highlight}");
                    }

                    // איסוף עד 5 נקודות חשובות
                    if (highlights.Count >= 5)
                    {
                        break;
                    }
                }

                // יצירת טקסט היעדים על סמך הנקודות החשובות
                if (highlights.Count > 0)
                {
                    tsha.Goals = "נקודות חשובות מהטיפולים האחרונים:\n\n";
                    foreach (string highlight in highlights)
                    {
                        tsha.Goals += $"- {highlight}\n";
                    }
                    tsha.Goals += "\nיעדים להמשך:\n\n";
                    tsha.Goals += "- [להשלמה על ידי הצוות]\n";
                }
            }

            return tsha;
        }
    }
}
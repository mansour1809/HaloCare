// BL/Services/KidService.cs - עדכון לאינטגרציה עם תהליך קליטה
using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class KidService
    {
        private readonly KidRepository _kidRepository;
        private readonly TreatmentRepository _treatmentRepository;
        private readonly AlertRepository _alertRepository;
        private readonly AttendanceRepository _attendanceRepository;
        //private readonly TSHARepository _tshaRepository;
        private readonly KidOnboardingService _onboardingService; // הוספה חדשה

        public KidService(IConfiguration configuration)
        {
            _kidRepository = new KidRepository(configuration);
            _treatmentRepository = new TreatmentRepository(configuration);
            _alertRepository = new AlertRepository(configuration);
            _attendanceRepository = new AttendanceRepository(configuration);
            //_tshaRepository = new TSHARepository(configuration);
            _onboardingService = new KidOnboardingService(configuration); // הוספה חדשה
        }

        public List<Kid> GetAllKids()
        {
            return _kidRepository.GetAllKids();
        }

        public Kid GetKidById(int id)
        {
            return _kidRepository.GetKidById(id);
        }

        public int AddKid(Kid kid)
        {
            // בדיקה שגיל הילד בין 0-3 שנים
            DateTime minBirthDate = DateTime.Today.AddYears(-3);
            if (kid.BirthDate < minBirthDate)
            {
                throw new ArgumentException("גיל הילד חייב להיות בין 0-3 שנים");
            }

            // ערכי ברירת מחדל
            kid.IsActive = true;

            // שמירת פרטי הילד
            int kidId = _kidRepository.AddKid(kid);

            // **הוספה חדשה: התחלת תהליך קליטה אוטומטית**
            try
            {
                _onboardingService.StartOnboardingProcess(kidId);
            }
            catch (Exception ex)
            {
                // לוג השגיאה אבל אל תכשיל את יצירת הילד
                Console.WriteLine($"Warning: Failed to start onboarding process for kid {kidId}: {ex.Message}");

                // יצירת התראה למנהל המערכת
                try
                {
                    var alert = new Alert
                    {
                        KidId = kidId,
                        AlertType = "onboarding_error",
                        //TargetDate = DateTime.Now,
                        Status = "active",
                        CreatedDate = DateTime.Now,
                        Description = $"כשל בהתחלת תהליך קליטה עבור ילד {kidId}"
                    };
                    _alertRepository.AddAlert(alert);
                }
                catch
                {
                    // אם גם ההתראה נכשלה, רק נמשיך
                }
            }

            return kidId;
        }

        public bool UpdateKid(Kid kid)
        {
            // בדיקה שהילד קיים
            Kid existingKid = _kidRepository.GetKidById(kid.Id);
            if (existingKid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // עדכון פרטי הילד
            return _kidRepository.UpdateKid(kid);
        }

        public bool DeactivateKid(int id)
        {
            // בדיקה שהילד קיים
            Kid existingKid = _kidRepository.GetKidById(id);
            if (existingKid == null)
            {
                throw new ArgumentException("הילד לא קיים");
            }

            // השבתת הילד
            return _kidRepository.DeactivateKid(id);
        }

        // **מתודות חדשות לאינטגרציה עם תהליך קליטה**

        /// <summary>
        /// קבלת תיק ילד עם סטטוס תהליך קליטה
        /// </summary>
        public object GetKidFileWithOnboarding(int kidId)
        {
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא");
            }

            // קבלת סטטוס תהליך קליטה
            var onboardingStatus = _onboardingService.GetOnboardingStatus(kidId);

            return new
            {
                Kid = kid,
                OnboardingStatus = onboardingStatus,
                Treatments = GetKidTreatments(kidId),
                Alerts = GetKidAlerts(kidId),
                Attendance = GetKidAttendance(kidId),
                //TSHAs = GetKidTSHAs(kidId)
            };
        }

        /// <summary>
        /// בדיקה אם ילד השלים תהליך קליטה
        /// </summary>
        public bool IsOnboardingCompleted(int kidId)
        {
            try
            {
                var onboardingStatus = _onboardingService.GetOnboardingStatus(kidId);
                return onboardingStatus?.Process.ProcessStatus == "Completed";
            }
            catch
            {
                return false; // אם אין תהליך קליטה, נחשב כלא הושלם
            }
        }

        /// <summary>
        /// קבלת רשימת ילדים עם סטטוס קליטה
        /// </summary>
        public List<object> GetKidsWithOnboardingStatus()
        {
            var kids = _kidRepository.GetAllKids();
            var result = new List<object>();

            foreach (var kid in kids)
            {
                var onboardingStatus = _onboardingService.GetOnboardingStatus(kid.Id);

                result.Add(new
                {
                    Kid = kid,
                    OnboardingCompleted = onboardingStatus?.Process.ProcessStatus == "Completed",
                    OnboardingProgress = onboardingStatus?.Stats.CompletionPercentage ?? 0,
                    DaysInOnboarding = onboardingStatus?.Stats.DaysInProcess ?? 0,
                    ActiveReminders = onboardingStatus?.Reminders.Count ?? 0
                });
            }

            return result;
        }

        /// <summary>
        /// התחלת תהליך קליטה ידני (במקרה שלא התחיל אוטומטית)
        /// </summary>
        public bool StartOnboardingManually(int kidId, int createdBy)
        {
            try
            {
                _onboardingService.StartOnboardingProcess(kidId, createdBy);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בהתחלת תהליך קליטה: {ex.Message}");
            }
        }

        // מתודות קיימות
        public List<Treatment> GetKidTreatments(int kidId)
        {
            return _treatmentRepository.GetTreatmentsByKidId(kidId);
        }

        public List<Alert> GetKidAlerts(int kidId)
        {
            return _alertRepository.GetAlertsByKidId(kidId);
        }

        public List<Attendance> GetKidAttendance(int kidId)
        {
            return _attendanceRepository.GetAttendancesByKidId(kidId);
        }

        //public List<TSHA> GetKidTSHAs(int kidId)
        //{
        //    return _tshaRepository.GetTSHAsByKidId(kidId);
        //}

        public Kid GetKidFile(int kidId)
        {
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא");
            }

            return kid;
        }
    }
}
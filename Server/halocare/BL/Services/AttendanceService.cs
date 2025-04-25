using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class AttendanceService
    {
        private readonly AttendanceRepository _attendanceRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;

        public AttendanceService(IConfiguration configuration)
        {
            _attendanceRepository = new AttendanceRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
        }

        public List<Attendance> GetAllAttendances()
        {
            return _attendanceRepository.GetAllAttendances();
        }

        public List<Attendance> GetAttendancesByKidId(int kidId)
        {
            return _attendanceRepository.GetAttendancesByKidId(kidId);
        }

        public List<Attendance> GetAttendancesByDate(DateTime date)
        {
            return _attendanceRepository.GetAttendancesByDate(date);
        }

        public int AddAttendance(Attendance attendance)
        {
            // וידוא שהילד קיים ופעיל
            Kid kid = _kidRepository.GetKidById(attendance.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן לדווח נוכחות לילד שאינו פעיל");
            }

            // וידוא שהעובד המדווח קיים ופעיל
            Employee reporter = _employeeRepository.GetEmployeeById(attendance.ReportedBy);
            if (reporter == null)
            {
                throw new ArgumentException("העובד המדווח לא נמצא במערכת");
            }
            if (!reporter.IsActive)
            {
                throw new ArgumentException("לא ניתן לדווח נוכחות על ידי עובד שאינו פעיל");
            }

            // אם הילד לא נוכח, חובה לציין סיבת היעדרות
            if (!attendance.IsPresent && string.IsNullOrEmpty(attendance.AbsenceReason))
            {
                throw new ArgumentException("חובה לציין סיבת היעדרות כאשר הילד לא נוכח");
            }

            // הגדרת תאריך הנוכחות אם לא צוין
            if (attendance.AttendanceDate == DateTime.MinValue)
            {
                attendance.AttendanceDate = DateTime.Today;
            }

            return _attendanceRepository.AddAttendance(attendance);
        }

        public bool UpdateAttendance(Attendance attendance)
        {
            // אם הילד לא נוכח, חובה לציין סיבת היעדרות
            if (!attendance.IsPresent && string.IsNullOrEmpty(attendance.AbsenceReason))
            {
                throw new ArgumentException("חובה לציין סיבת היעדרות כאשר הילד לא נוכח");
            }

            return _attendanceRepository.UpdateAttendance(attendance);
        }

        public Dictionary<DateTime, int> GetMonthlyAttendanceSummary(int month, int year)
        {
            Dictionary<DateTime, int> summary = new Dictionary<DateTime, int>();

            // קביעת תחילת וסוף החודש
            DateTime startDate = new DateTime(year, month, 1);
            DateTime endDate = startDate.AddMonths(1).AddDays(-1);

            // עבור כל יום בחודש
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // קבלת רשימת הנוכחות ליום זה
                List<Attendance> dailyAttendance = _attendanceRepository.GetAttendancesByDate(date);

                // ספירת מספר הילדים שהיו נוכחים
                int presentCount = 0;
                foreach (Attendance attendance in dailyAttendance)
                {
                    if (attendance.IsPresent)
                    {
                        presentCount++;
                    }
                }

                summary.Add(date, presentCount);
            }

            return summary;
        }
    }
}
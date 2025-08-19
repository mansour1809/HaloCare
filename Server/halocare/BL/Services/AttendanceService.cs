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
            // Ensure the child exists and is active
            Kid kid = _kidRepository.GetKidById(attendance.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן לדווח נוכחות לילד שאינו פעיל");
            }

            // Ensure the reporting employee exists and is active
            Employee reporter = _employeeRepository.GetEmployeeById(attendance.ReportedBy);
            if (reporter == null)
            {
                throw new ArgumentException("העובד המדווח לא נמצא במערכת");
            }
            if (!reporter.IsActive)
            {
                throw new ArgumentException("לא ניתן לדווח נוכחות על ידי עובד שאינו פעיל");
            }


            // Set attendance date if not provided
            if (attendance.AttendanceDate == DateTime.MinValue)
            {
                attendance.AttendanceDate = DateTime.Today;
            }

            return _attendanceRepository.AddAttendance(attendance);
        }

        public bool UpdateAttendance(Attendance attendance)
        {

            return _attendanceRepository.UpdateAttendance(attendance);
        }

        public Dictionary<DateTime, int> GetMonthlyAttendanceSummary(int month, int year)
        {
            Dictionary<DateTime, int> summary = new Dictionary<DateTime, int>();

            // Determine start and end of the month
            DateTime startDate = new DateTime(year, month, 1);
            DateTime endDate = startDate.AddMonths(1).AddDays(-1);

            // Iterate through each day of the month
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Get the attendance list for this day
                List<Attendance> dailyAttendance = _attendanceRepository.GetAttendancesByDate(date);

                // Count how many children were present
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

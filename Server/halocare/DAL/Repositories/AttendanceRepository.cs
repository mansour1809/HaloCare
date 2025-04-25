using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class AttendanceRepository : DBService
    {
        public AttendanceRepository(IConfiguration configuration) : base(configuration) { }

        public List<Attendance> GetAllAttendances()
        {
            List<Attendance> attendances = new List<Attendance>();
            DataTable dataTable = ExecuteQuery("SP_GetAllAttendances");

            foreach (DataRow row in dataTable.Rows)
            {
                Attendance attendance = new Attendance
                {
                    AttendanceId = Convert.ToInt32(row["AttendanceId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    AttendanceDate = Convert.ToDateTime(row["AttendanceDate"]),
                    IsPresent = Convert.ToBoolean(row["IsPresent"]),
                    AbsenceReason = row["AbsenceReason"].ToString(),
                    ReportedBy = Convert.ToInt32(row["ReportedBy"])
                };

                attendances.Add(attendance);
            }

            return attendances;
        }

        public List<Attendance> GetAttendancesByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<Attendance> attendances = new List<Attendance>();
            DataTable dataTable = ExecuteQuery("SP_GetAttendancesByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Attendance attendance = new Attendance
                {
                    AttendanceId = Convert.ToInt32(row["AttendanceId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    AttendanceDate = Convert.ToDateTime(row["AttendanceDate"]),
                    IsPresent = Convert.ToBoolean(row["IsPresent"]),
                    AbsenceReason = row["AbsenceReason"].ToString(),
                    ReportedBy = Convert.ToInt32(row["ReportedBy"])
                };

                attendances.Add(attendance);
            }

            return attendances;
        }

        public List<Attendance> GetAttendancesByDate(DateTime date)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AttendanceDate", date.Date }
            };

            List<Attendance> attendances = new List<Attendance>();
            DataTable dataTable = ExecuteQuery("SP_GetAttendancesByDate", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Attendance attendance = new Attendance
                {
                    AttendanceId = Convert.ToInt32(row["AttendanceId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    AttendanceDate = Convert.ToDateTime(row["AttendanceDate"]),
                    IsPresent = Convert.ToBoolean(row["IsPresent"]),
                    AbsenceReason = row["AbsenceReason"].ToString(),
                    ReportedBy = Convert.ToInt32(row["ReportedBy"])
                };

                attendances.Add(attendance);
            }

            return attendances;
        }

        public int AddAttendance(Attendance attendance)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", attendance.KidId },
                { "@AttendanceDate", attendance.AttendanceDate },
                { "@IsPresent", attendance.IsPresent },
                { "@AbsenceReason", attendance.AbsenceReason },
                { "@ReportedBy", attendance.ReportedBy }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddAttendance", parameters));
        }

        public bool UpdateAttendance(Attendance attendance)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AttendanceId", attendance.AttendanceId },
                { "@KidId", attendance.KidId },
                { "@AttendanceDate", attendance.AttendanceDate },
                { "@IsPresent", attendance.IsPresent },
                { "@AbsenceReason", attendance.AbsenceReason },
                { "@ReportedBy", attendance.ReportedBy }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateAttendance", parameters);
            return rowsAffected > 0;
        }
    }
}
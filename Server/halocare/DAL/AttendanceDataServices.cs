using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class AttendanceDataServices : DBService
    {
        public AttendanceDataServices(IConfiguration configuration) : base(configuration) { }

        private Attendance MapAttendance(SqlDataReader dr)
        {
            return new Attendance
            {
                AttendanceId = (int)dr["attendanceId"],
                KidId = (int)dr["kidId"],
                AttendanceDate = (DateTime)dr["attendanceDate"],
                Status = dr["status"].ToString(),
                Notes = dr["notes"]?.ToString()
            };
        }

        public List<Attendance> GetAttendanceByKid(int kidId)
        {
            List<Attendance> attendances = new List<Attendance>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kidId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAttendanceByKid", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            attendances.Add(MapAttendance(dr));
                        }
                    }
                }
                return attendances.OrderByDescending(a => a.AttendanceDate).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAttendanceByKid", ex);
            }
        }

        public List<Attendance> GetAttendanceByDate(DateTime date)
        {
            List<Attendance> attendances = new List<Attendance>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@date", date.Date }  // רק התאריך, ללא שעה
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAttendanceByDate", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            attendances.Add(MapAttendance(dr));
                        }
                    }
                }
                return attendances;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAttendanceByDate", ex);
            }
        }

        public int InsertAttendance(Attendance attendance)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", attendance.KidId },
                    { "@attendanceDate", attendance.AttendanceDate.Date }, // רק התאריך, ללא שעה
                    { "@status", attendance.Status },
                    { "@notes", attendance.Notes ?? (object)DBNull.Value }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertAttendance", con, parameters);
                    SqlParameter outputParam = new SqlParameter("@newId", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    cmd.Parameters.Add(outputParam);

                    cmd.ExecuteNonQuery();
                    return (int)outputParam.Value;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in InsertAttendance", ex);
            }
        }

        public bool UpdateAttendance(Attendance attendance)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@attendanceId", attendance.AttendanceId },
                    { "@status", attendance.Status },
                    { "@notes", attendance.Notes ?? (object)DBNull.Value }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateAttendance", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateAttendance", ex);
            }
        }

        public List<Attendance> GetAttendanceByDateRange(DateTime startDate, DateTime endDate, int? kidId = null)
        {
            List<Attendance> attendances = new List<Attendance>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@startDate", startDate.Date },
                    { "@endDate", endDate.Date }
                };

                    if (kidId.HasValue)
                    {
                        parameters.Add("@kidId", kidId.Value);
                    }

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAttendanceByDateRange", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            attendances.Add(MapAttendance(dr));
                        }
                    }
                }
                return attendances.OrderByDescending(a => a.AttendanceDate).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAttendanceByDateRange", ex);
            }
        }
    }
}


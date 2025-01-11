using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class EmployeeDataServices : DBService
    {
        public EmployeeDataServices(IConfiguration configuration) : base(configuration) { }

        private Employee MapEmployee(SqlDataReader dr)
        {
            return new Employee
            {
                EmployeeNum = (int)dr["employeeNum"],
                FirstName = dr["firstName"].ToString(),
                LastName = dr["lastName"].ToString(),
                RoleName = dr["roleName"].ToString(),
                Specialty = dr["specialty"]?.ToString(),
                Status = (bool)dr["status"],
                Email = dr["email"]?.ToString()
            };
        }

        public Employee GetEmployeeById(int employeeId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeId", employeeId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetEmployeeById", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapEmployee(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetEmployeeById", ex);
            }
        }

        public List<Employee> GetAllEmployees()
        {
            List<Employee> employees = new List<Employee>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllEmployees", con);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            employees.Add(MapEmployee(dr));
                        }
                    }
                }
                return employees;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAllEmployees", ex);
            }
        }

        public List<Employee> GetEmployeesByRole(string roleName)
        {
            List<Employee> employees = new List<Employee>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@roleName", roleName }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetEmployeesByRole", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            employees.Add(MapEmployee(dr));
                        }
                    }
                }
                return employees;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetEmployeesByRole", ex);
            }
        }

        public int InsertEmployee(Employee employee)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@firstName", employee.FirstName },
                    { "@lastName", employee.LastName },
                    { "@roleName", employee.RoleName },
                    { "@specialty", employee.Specialty },
                    { "@status", employee.Status },
                    { "@email", employee.Email }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertEmployee", con, parameters);
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
                throw new Exception("Error in InsertEmployee", ex);
            }
        }

        public bool UpdateEmployee(Employee employee)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeNum", employee.EmployeeNum },
                    { "@firstName", employee.FirstName },
                    { "@lastName", employee.LastName },
                    { "@roleName", employee.RoleName },
                    { "@specialty", employee.Specialty },
                    { "@status", employee.Status },
                    { "@email", employee.Email }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateEmployee", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateEmployee", ex);
            }
        }
    }
}
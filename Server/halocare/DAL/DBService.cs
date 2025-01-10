using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
namespace halocare.DAL
{
 
    public class DBService
    {
        private readonly IConfiguration _configuration;

        public DBService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public SqlConnection Connect()
        {
            string connectionString = _configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            return con;
        }

        protected SqlCommand CreateStoredProcCommand(string spName, SqlConnection con, Dictionary<string, object> parameters = null)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = System.Data.CommandType.StoredProcedure
            };

            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                }
            }

            return cmd;
        }
    }
}
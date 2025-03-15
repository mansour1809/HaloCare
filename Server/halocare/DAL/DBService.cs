using System;
using System.Collections.Generic;
using System.Data;
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

        public SqlConnection Connect(string conString = "myProjDB")
        {
            Console.WriteLine(conString);
            string connectionString = _configuration.GetConnectionString(conString);
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            return con;
        }

        public SqlCommand CreateCommand(string spName, SqlConnection con, Dictionary<string, object> paramDic = null)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = CommandType.StoredProcedure;

            if (paramDic != null)
            {
                foreach (KeyValuePair<string, object> param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                }
            }

            return cmd;
        }

        //Returning a DataTable (as datareader)
        public DataTable ExecuteQuery(string spName, Dictionary<string, object> parameters = null)
        {
            DataTable dataTable = new DataTable();

            using (SqlConnection con = Connect())
            {
                using (SqlCommand cmd = CreateCommand(spName, con, parameters))
                {
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dataTable);
                    }
                }
            }

            return dataTable;
        }

        //Not returns values
        public int ExecuteNonQuery(string spName, Dictionary<string, object> parameters = null)
        {
            using (SqlConnection con = Connect())
            {
                using (SqlCommand cmd = CreateCommand(spName, con, parameters))
                {
                    return cmd.ExecuteNonQuery();
                }
            }
        }

        // Returning a single value
        public object ExecuteScalar(string spName, Dictionary<string, object> parameters = null)
        {
            using (SqlConnection con = Connect())
            {
                using (SqlCommand cmd = CreateCommand(spName, con, parameters))
                {
                    return cmd.ExecuteScalar();
                }
            }
        }
    }
}
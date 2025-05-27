using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class FormRepository : DBService
    {
        public FormRepository(IConfiguration configuration) : base(configuration) { }

        public List<Form> GetAllForms()
        {
            List<Form> forms = new List<Form>();
            DataTable dataTable = ExecuteQuery("SP_GetAllForms");

            foreach (DataRow row in dataTable.Rows)
            {
                Form form = new Form
                {
                    FormId = Convert.ToInt32(row["FormId"]),
                    FormName = row["FormName"].ToString(),
                    FormDescription = row["FormDescription"].ToString(),
                    FormOrder = row["FormOrder"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["FormOrder"]),
                    IsFirstStep = Convert.ToBoolean(row["IsFirstStep"])
                };

                forms.Add(form);
            }

            return forms;
        }

        public Form GetFormById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetFormById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Form form = new Form
            {
                FormId = Convert.ToInt32(row["FormId"]),
                FormName = row["FormName"].ToString(),
                FormDescription = row["FormDescription"].ToString(),
                FormOrder = row["FormOrder"] == DBNull.Value ? null : (int?)Convert.ToInt32(row["FormOrder"]),
                IsFirstStep = Convert.ToBoolean(row["IsFirstStep"])
            };

            return form;
        }

        public int AddForm(Form form)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormName", form.FormName },
                { "@FormDescription", form.FormDescription },
                { "@FormOrder", form.FormOrder ?? (object)DBNull.Value },
                { "@IsFirstStep", form.IsFirstStep }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddForm", parameters));
        }

        public bool UpdateForm(Form form)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", form.FormId },
                { "@FormName", form.FormName },
                { "@FormDescription", form.FormDescription },
                { "@FormOrder", form.FormOrder ?? (object)DBNull.Value },
                { "@IsFirstStep", form.IsFirstStep }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateForm", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteForm(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteForm", parameters);
            return rowsAffected > 0;
        }
    }
}

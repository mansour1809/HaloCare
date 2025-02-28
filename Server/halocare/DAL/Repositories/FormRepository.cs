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
            DataTable dataTable = ExecuteQuery("GetAllForms");

            foreach (DataRow row in dataTable.Rows)
            {
                Form form = new Form
                {
                    FormId = Convert.ToInt32(row["FormId"]),
                    FormName = row["FormName"].ToString(),
                    FormDescription = row["FormDescription"].ToString()
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

            DataTable dataTable = ExecuteQuery("GetFormById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Form form = new Form
            {
                FormId = Convert.ToInt32(row["FormId"]),
                FormName = row["FormName"].ToString(),
                FormDescription = row["FormDescription"].ToString()
            };

            return form;
        }

        public int AddForm(Form form)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormName", form.FormName },
                { "@FormDescription", form.FormDescription }
            };

            return Convert.ToInt32(ExecuteScalar("AddForm", parameters));
        }

        public bool UpdateForm(Form form)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", form.FormId },
                { "@FormName", form.FormName },
                { "@FormDescription", form.FormDescription }
            };

            int rowsAffected = ExecuteNonQuery("UpdateForm", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteForm(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", id }
            };

            int rowsAffected = ExecuteNonQuery("DeleteForm", parameters);
            return rowsAffected > 0;
        }
    }
}
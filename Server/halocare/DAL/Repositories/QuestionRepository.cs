using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class QuestionRepository : DBService
    {
        public QuestionRepository(IConfiguration configuration) : base(configuration) { }

        public List<Question> GetQuestionsByFormId(int formId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", formId }
            };

            List<Question> questions = new List<Question>();
            DataTable dataTable = ExecuteQuery("SP_GetQuestionsByFormId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Question question = new Question
                {
                    FormId = Convert.ToInt32(row["FormId"]),
                    QuestionNo = Convert.ToInt32(row["QuestionNo"]),
                    QuestionText = row["QuestionText"] != DBNull.Value ? row["QuestionText"].ToString() : string.Empty,
                    IsMandatory = row["IsMandatory"] != DBNull.Value ? Convert.ToBoolean(row["IsMandatory"]) : false,
                    IsOpen = row["IsOpen"] != DBNull.Value ? Convert.ToBoolean(row["IsOpen"]) : false,
                    HowManyVal = row["HowManyVal"] != DBNull.Value ? Convert.ToInt32(row["HowManyVal"]) : 0,
                    PossibleValues = row["PossibleValues"] != DBNull.Value ? row["PossibleValues"].ToString() : string.Empty,
                    HasOther = row["HasOther"] != DBNull.Value ? Convert.ToBoolean(row["HasOther"]) : false
                };

                questions.Add(question);
            }

            return questions;
        }

        public Question GetQuestion(int formId, int questionNo)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", formId },
                { "@QuestionNo", questionNo }
            };

            DataTable dataTable = ExecuteQuery("SP_GetQuestion", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Question question = new Question
            {
                FormId = Convert.ToInt32(row["FormId"]),
                QuestionNo = Convert.ToInt32(row["QuestionNo"]),
                QuestionText = row["QuestionText"].ToString(),
                IsMandatory = Convert.ToBoolean(row["IsMandatory"]),
                IsOpen = Convert.ToBoolean(row["IsOpen"]),
                HowManyVal = Convert.ToInt32(row["HowManyVal"]),
                PossibleValues = row["PossibleValues"].ToString(),
                HasOther = Convert.ToBoolean(row["HasOther"])
            };

            return question;
        }

        public bool AddQuestion(Question question)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", question.FormId },
                { "@QuestionNo", question.QuestionNo },
                { "@QuestionText", question.QuestionText },
                { "@IsMandatory", question.IsMandatory },
                { "@IsOpen", question.IsOpen },
                { "@HowManyVal", question.HowManyVal },
                { "@PossibleValues", question.PossibleValues },
                { "@HasOther", question.HasOther }
            };

            int rowsAffected = ExecuteNonQuery("SP_AddQuestion", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateQuestion(Question question)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", question.FormId },
                { "@QuestionNo", question.QuestionNo },
                { "@QuestionText", question.QuestionText },
                { "@IsMandatory", question.IsMandatory },
                { "@IsOpen", question.IsOpen },
                { "@HowManyVal", question.HowManyVal },
                { "@PossibleValues", question.PossibleValues },
                { "@HasOther", question.HasOther }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateQuestion", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteQuestion(int formId, int questionNo)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FormId", formId },
                { "@QuestionNo", questionNo }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteQuestion", parameters);
            return rowsAffected > 0;
        }
    }
}
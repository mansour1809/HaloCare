﻿using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using halocare.DAL;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class AnswerToQuestionRepository : DBService
    {
        public AnswerToQuestionRepository(IConfiguration configuration) : base(configuration) { }

        public List<AnswerToQuestion> GetAnswersByKidAndForm(int kidId, int formId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId }
            };

            List<AnswerToQuestion> answers = new List<AnswerToQuestion>();
            DataTable dataTable = ExecuteQuery("GetAnswersByKidAndForm", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                AnswerToQuestion answer = new AnswerToQuestion
                {
                    AnswerId = Convert.ToInt32(row["AnswerId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    FormId = Convert.ToInt32(row["FormId"]),
                    QuestionNo = Convert.ToInt32(row["QuestionNo"]),
                    AnsDate = Convert.ToDateTime(row["AnsDate"]),
                    Answer = row["Answer"].ToString(),
                    Other = row["Other"].ToString(),
                    EmployeeId = row["EmployeeId"] != DBNull.Value ? Convert.ToInt32(row["EmployeeId"]) : null,
                    ByParent = Convert.ToBoolean(row["ByParent"])
                };

                answers.Add(answer);
            }

            return answers;
        }

        public AnswerToQuestion GetAnswerById(int answerId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AnswerId", answerId }
            };

            DataTable dataTable = ExecuteQuery("GetAnswerById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            AnswerToQuestion answer = new AnswerToQuestion
            {
                AnswerId = Convert.ToInt32(row["AnswerId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                FormId = Convert.ToInt32(row["FormId"]),
                QuestionNo = Convert.ToInt32(row["QuestionNo"]),
                AnsDate = Convert.ToDateTime(row["AnsDate"]),
                Answer = row["Answer"].ToString(),
                Other = row["Other"].ToString(),
                EmployeeId = row["EmployeeId"] != DBNull.Value ? Convert.ToInt32(row["EmployeeId"]) : null,
                ByParent = Convert.ToBoolean(row["ByParent"])
            };

            return answer;
        }

        public int AddAnswer(AnswerToQuestion answer)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", answer.KidId },
                { "@FormId", answer.FormId },
                { "@QuestionNo", answer.QuestionNo },
                { "@AnsDate", answer.AnsDate },
                { "@Answer", answer.Answer },
                { "@Other", answer.Other },
                { "@EmployeeId", answer.EmployeeId },
                { "@ByParent", answer.ByParent }
            };

            return Convert.ToInt32(ExecuteScalar("AddAnswer", parameters));
        }

        public bool UpdateAnswer(AnswerToQuestion answer)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AnswerId", answer.AnswerId },
                { "@KidId", answer.KidId },
                { "@FormId", answer.FormId },
                { "@QuestionNo", answer.QuestionNo },
                { "@AnsDate", answer.AnsDate },
                { "@Answer", answer.Answer },
                { "@Other", answer.Other },
                { "@EmployeeId", answer.EmployeeId },
                { "@ByParent", answer.ByParent }
            };

            int rowsAffected = ExecuteNonQuery("UpdateAnswer", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteAnswer(int answerId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AnswerId", answerId }
            };

            int rowsAffected = ExecuteNonQuery("DeleteAnswer", parameters);
            return rowsAffected > 0;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Data;
using GanHayeled.DAL.Models;
using halocare.DAL.Models;
using halocare.DAL;
using Microsoft.Extensions.Configuration;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace GanHayeled.DAL.Repositories
{
    public class AnswerToQuestionRepository : DBService
    {
        public AnswerToQuestionRepository(IConfiguration configuration) : base(configuration) { }

        public List<AnswerToQuestion> GetAnswersByKidAndForm(int kidId, int formId)
        {
            Dictionary < string
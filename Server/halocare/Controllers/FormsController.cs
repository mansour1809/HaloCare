// Controller for handling operations related to forms
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FormsController : ControllerBase
    {
        private readonly FormService _formService;

        public FormsController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
        }

        // Get all forms
        [HttpGet]
        public ActionResult<IEnumerable<Form>> GetForms()
        {
            try
            {
                return Ok(_formService.GetAllForms());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Get form by ID
        [HttpGet("{id}")]
        public ActionResult<Form> GetForm(int id)
        {
            try
            {
                var form = _formService.GetFormById(id);

                if (form == null)
                {
                    return NotFound($"טופס עם מזהה {id} לא נמצא");
                }

                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Get questions of a specific form
        [HttpGet("{id}/questions")]
        public ActionResult<IEnumerable<Question>> GetFormQuestions(int id)
        {
            try
            {
                var questions = _formService.GetFormQuestions(id);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Get answers to a form for a specific child
        [HttpGet("answers/kid/{kidId}/form/{formId}")]
        public ActionResult<IEnumerable<AnswerToQuestion>> GetFormAnswers(int kidId, int formId)
        {
            try
            {
                var answers = _formService.GetFormAnswers(kidId, formId);
                return Ok(answers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Create a new form
        [HttpPost]
        public ActionResult<Form> PostForm(Form form)
        {
            try
            {
                int formId = _formService.AddForm(form);
                form.FormId = formId;

                return CreatedAtAction(nameof(GetForm), new { id = formId }, form);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Update existing form
        [HttpPut("{id}")]
        public IActionResult PutForm(int id, Form form)
        {
            if (id != form.FormId)
            {
                return BadRequest("מזהה הטופס בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _formService.UpdateForm(form);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"טופס עם מזהה {id} לא נמצא");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Delete form by ID
        [HttpDelete("{id}")]
        public IActionResult DeleteForm(int id)
        {
            try
            {
                bool deleted = _formService.DeleteForm(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"טופס עם מזהה {id} לא נמצא");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Add a new question to a form
        [HttpPost("questions")]
        public IActionResult PostQuestion(Question question)
        {
            try
            {
                bool added = _formService.AddQuestion(question);

                if (added)
                {
                    return CreatedAtAction(nameof(GetFormQuestions), new { id = question.FormId }, question);
                }
                else
                {
                    return BadRequest("לא ניתן להוסיף את השאלה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Update existing question in a form
        [HttpPut("questions/{formId}/{questionNo}")]
        public IActionResult PutQuestion(int formId, int questionNo, Question question)
        {
            if (formId != question.FormId || questionNo != question.QuestionNo)
            {
                return BadRequest("מזהי הטופס או השאלה בנתיב אינם תואמים למזהים בגוף הבקשה");
            }

            try
            {
                bool updated = _formService.UpdateQuestion(question);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"שאלה מספר {questionNo} בטופס {formId} לא נמצאה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Delete a question from a form
        [HttpDelete("questions/{formId}/{questionNo}")]
        public IActionResult DeleteQuestion(int formId, int questionNo)
        {
            try
            {
                bool deleted = _formService.DeleteQuestion(formId, questionNo);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"שאלה מספר {questionNo} בטופס {formId} לא נמצאה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Submit a new answer to a question
        [HttpPost("answers")]
        public ActionResult<AnswerToQuestion> PostAnswer(AnswerToQuestion answer)
        {
            try
            {
                int answerId = _formService.AddAnswer(answer);
                answer.AnswerId = answerId;

                return Ok(answer);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Update an existing answer
        [HttpPut("answers/{id}")]
        public IActionResult PutAnswer(int id, AnswerToQuestion answer)
        {
            if (id != answer.AnswerId)
            {
                return BadRequest("מזהה התשובה בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _formService.UpdateAnswer(answer);

                if (updated)
                {
                    return Ok();
                }
                else
                {
                    return NotFound($"תשובה עם מזהה {id} לא נמצאה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Delete answer by ID
        [HttpDelete("answers/{id}")]
        public IActionResult DeleteAnswer(int id)
        {
            try
            {
                bool deleted = _formService.DeleteAnswer(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"תשובה עם מזהה {id} לא נמצאה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Get critical medical info for a child
        [HttpGet("critical-medical-info/{kidId}")]
        public ActionResult<IEnumerable<CriticalInfoData>> GetCriticalMedicalInfo(int kidId)
        {
            try
            {
                var criticalInfo = _formService.GetCriticalMedicalInfo(kidId);
                return Ok(criticalInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Add answer with multiple entries (complex data)
        [HttpPost("answers/with-multiple-entries")]
        public ActionResult<AnswerToQuestion> PostAnswerWithMultipleEntries([FromBody] AnswerWithMultipleEntriesRequest request)
        {
            try
            {
                // Convert complex data to JSON
                string multipleEntriesJson = null;
                if (request.MultipleEntries != null && request.MultipleEntries.Count > 0)
                {
                    multipleEntriesJson = System.Text.Json.JsonSerializer.Serialize(request.MultipleEntries);
                }

                var answerData = new AnswerToQuestion
                {
                    KidId = request.KidId,
                    FormId = request.FormId,
                    QuestionNo = request.QuestionNo,
                    AnsDate = DateTime.Now,
                    Answer = request.Answer,
                    Other = request.Other,
                    EmployeeId = request.EmployeeId,
                    ByParent = request.ByParent,
                    MultipleEntries = multipleEntriesJson
                };

                int answerId = _formService.AddAnswer(answerData);
                answerData.AnswerId = answerId;

                return CreatedAtAction(nameof(GetFormAnswers),
                    new { kidId = request.KidId, formId = request.FormId },
                    answerData);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Update answer with multiple entries
        [HttpPut("answers/{answerId}/with-multiple-entries")]
        public IActionResult PutAnswerWithMultipleEntries(int answerId, [FromBody] AnswerWithMultipleEntriesRequest request)
        {
            try
            {
                // Convert complex data to JSON
                string multipleEntriesJson = null;
                if (request.MultipleEntries != null && request.MultipleEntries.Count > 0)
                {
                    multipleEntriesJson = System.Text.Json.JsonSerializer.Serialize(request.MultipleEntries);
                }

                var answerData = new AnswerToQuestion
                {
                    AnswerId = answerId,
                    Answer = request.Answer,
                    Other = request.Other,
                    EmployeeId = request.EmployeeId,
                    ByParent = request.ByParent,
                    MultipleEntries = multipleEntriesJson
                };

                bool updated = _formService.UpdateAnswer(answerData);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"תשובה עם מזהה {answerId} לא נמצאה");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
    }

    // Request model for complex answer entries
    public class AnswerWithMultipleEntriesRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public int QuestionNo { get; set; }
        public string Answer { get; set; }
        public string Other { get; set; }
        public int? EmployeeId { get; set; }
        public bool ByParent { get; set; }
        public List<Dictionary<string, object>> MultipleEntries { get; set; }
    }
}

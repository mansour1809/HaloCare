using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using halocare.BL.Services;

namespace halocare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TranslationController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public TranslationController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        // תרגום טופס שלם לשפה מבוקשת
        [HttpPost("translate-form")]
        [AllowAnonymous]
        public async Task<IActionResult> TranslateForm([FromBody] TranslateFormRequest request)
        {
            try
            {
                var translatedData = await _geminiService.TranslateFormAsync(
                    request.Questions,
                    request.TargetLanguage,
                    request.SourceLanguage ?? "he"
                );

                return Ok(new
                {
                    success = true,
                    translatedQuestions = translatedData
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "שגיאה בתרגום הטופס",
                    error = ex.Message
                });
            }
        }

        // תרגום תשובות חזרה לעברית
        [HttpPost("translate-answers")]
        [AllowAnonymous]
        public async Task<IActionResult> TranslateAnswers([FromBody] TranslateAnswersRequest request)
        {
            try
            {
                var translatedAnswers = await _geminiService.TranslateAnswersAsync(
                    request.Answers,
                    request.SourceLanguage,
                    "he" // תמיד מתרגמים חזרה לעברית
                );

                return Ok(new
                {
                    success = true,
                    translatedAnswers = translatedAnswers
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "שגיאה בתרגום התשובות",
                    error = ex.Message
                });
            }
        }
    }

    // Request Models
    public class TranslateFormRequest
    {
        public List<QuestionTranslationDto> Questions { get; set; }
        public string TargetLanguage { get; set; }
        public string SourceLanguage { get; set; }
    }

    public class TranslateAnswersRequest
    {
        public List<AnswerTranslationDto> Answers { get; set; }
        public string SourceLanguage { get; set; }
    }

    // DTOs
    public class QuestionTranslationDto
    {
        public int QuestionNo { get; set; }
        public string QuestionText { get; set; }
        public string PossibleValues { get; set; } // comma separated values
        public string QuestionType { get; set; }
    }

    public class AnswerTranslationDto
    {
        public int QuestionNo { get; set; }
        public string Answer { get; set; }
        public string Other { get; set; }
    }
}
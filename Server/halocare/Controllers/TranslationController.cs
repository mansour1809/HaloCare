using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TranslationController : ControllerBase
    {
        private readonly TranslationService _translationService;

        public TranslationController(IConfiguration configuration)
        {
            _translationService = new TranslationService(configuration);
        }

        // POST: api/Translation/translate
        [HttpPost("translate")]
        public async Task<ActionResult<string>> TranslateText([FromBody] TranslationRequest request)
        {
            try
            {
                string translatedText = await _translationService.TranslateTextAsync(
                    request.Text,
                    request.SourceLanguage,
                    request.TargetLanguage);

                return Ok(new { TranslatedText = translatedText });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בתרגום: {ex.Message}");
            }
        }

        // POST: api/Translation/detect
        [HttpPost("detect")]
        public async Task<ActionResult<string>> DetectLanguage([FromBody] DetectionRequest request)
        {
            try
            {
                string detectedLanguage = await _translationService.DetectLanguageAsync(request.Text);
                return Ok(new { Language = detectedLanguage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בזיהוי שפה: {ex.Message}");
            }
        }
    }

    public class TranslationRequest
    {
        public string Text { get; set; }
        public string SourceLanguage { get; set; }
        public string TargetLanguage { get; set; }
    }

    public class DetectionRequest
    {
        public string Text { get; set; }
    }
}
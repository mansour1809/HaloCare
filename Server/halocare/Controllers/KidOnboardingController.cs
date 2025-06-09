// Controllers/OnboardingController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
//using halocare.DAL.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OnboardingController : ControllerBase
    {
        private readonly KidOnboardingService _onboardingService;

        public OnboardingController(IConfiguration configuration)
        {
            _onboardingService = new KidOnboardingService(configuration);
        }

        #region תהליך קליטה עיקרי

        /// <summary>
        /// התחלת תהליך קליטה חדש לילד
        /// POST: api/Onboarding/start
        /// </summary>
        [HttpPost("start")]
        public ActionResult<object> StartOnboardingProcess([FromBody] StartOnboardingRequest request)
        {
            try
            {
                if (request.KidId <= 0)
                {
                    return BadRequest("מזהה ילד חייב להיות חיובי");
                }

                // TODO: לקבל את המשתמש הנוכחי מה-JWT token
                var currentUserId = GetCurrentUserId();

                int processId = _onboardingService.StartOnboardingProcess(request.KidId, currentUserId);

                return Ok(new
                {
                    ProcessId = processId,
                    KidId = request.KidId,
                    Message = "תהליך קליטה התחיל בהצלחה",
                    StartedAt = DateTime.Now
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
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

        /// <summary>
        /// קבלת סטטוס מפורט של תהליך קליטה
        /// GET: api/Onboarding/status/5
        /// </summary>
        [HttpGet("status/{kidId}")]
        public ActionResult<OnboardingStatusDto> GetOnboardingStatus(int kidId)
        {
            try
            {
                var status = _onboardingService.GetOnboardingStatus(kidId);

                if (status == null)
                {
                    return NotFound($"לא נמצא תהליך קליטה עבור ילד {kidId}");
                }

                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת סטטוס: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת סיכום קצר של תהליך הקליטה
        /// GET: api/Onboarding/summary/5
        /// </summary>
        [HttpGet("summary/{kidId}")]
        public ActionResult<object> GetOnboardingSummary(int kidId)
        {
            try
            {
                var status = _onboardingService.GetOnboardingStatus(kidId);

                if (status == null)
                {
                    return NotFound($"לא נמצא תהליך קליטה עבור ילד {kidId}");
                }

                var summary = new
                {
                    KidId = kidId,
                    KidName = status.Process.KidName,
                    ProcessStatus = status.Process.ProcessStatus,
                    CompletionPercentage = status.Stats.CompletionPercentage,
                    CompletedForms = status.Stats.CompletedForms,
                    TotalForms = status.Stats.TotalForms,
                    DaysInProcess = status.Stats.DaysInProcess,
                    NextForm = status.Stats.NextRecommendedForm?.FormName,
                    ActiveReminders = status.Reminders.Count,
                    LastUpdated = status.Process.LastUpdated
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת סיכום: {ex.Message}");
            }
        }

        #endregion

        #region ניהול טפסים

        /// <summary>
        /// התחלת מילוי טופס
        /// POST: api/Onboarding/forms/start
        /// </summary>
        [HttpPost("forms/start")]
        public ActionResult StartForm([FromBody] StartFormRequest request)
        {
            try
            {
                if (request.KidId <= 0 || request.FormId <= 0)
                {
                    return BadRequest("מזהה ילד ומזהה טופס חייבים להיות חיוביים");
                }

                var currentUserId = GetCurrentUserId();
                bool success = _onboardingService.StartForm(request.KidId, request.FormId, currentUserId);

                if (success)
                {
                    return Ok(new { Message = "טופס החל בהצלחה" });
                }
                else
                {
                    return BadRequest("לא ניתן להתחיל את הטופס");
                }
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהתחלת טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון התקדמות במילוי טופס (קורה אוטומטית אחרי שמירת תשובות)
        /// PUT: api/Onboarding/forms/progress
        /// </summary>
        [HttpPut("forms/progress")]
        public ActionResult UpdateFormProgress([FromBody] UpdateProgressRequest request)
        {
            try
            {
                if (request.KidId <= 0 || request.FormId <= 0)
                {
                    return BadRequest("מזהה ילד ומזהה טופס חייבים להיות חיוביים");
                }

                bool success = _onboardingService.UpdateFormProgress(request.KidId, request.FormId);

                if (success)
                {
                    return Ok(new { Message = "התקדמות עודכנה בהצלחה" });
                }
                else
                {
                    return BadRequest("לא ניתן לעדכן את ההתקדמות");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בעדכון התקדמות: {ex.Message}");
            }
        }

        /// <summary>
        /// השלמת טופס
        /// PUT: api/Onboarding/forms/complete
        /// </summary>
        [HttpPut("forms/complete")]
        public ActionResult CompleteForm([FromBody] CompleteFormRequest request)
        {
            try
            {
                if (request.KidId <= 0 || request.FormId <= 0)
                {
                    return BadRequest("מזהה ילד ומזהה טופס חייבים להיות חיוביים");
                }

                bool success = _onboardingService.CompleteForm(request.KidId, request.FormId);

                if (success)
                {
                    return Ok(new { Message = "טופס הושלם בהצלחה" });
                }
                else
                {
                    return BadRequest("לא ניתן להשלים את הטופס");
                }
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהשלמת טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// שליחת טופס להורים
        /// POST: api/Onboarding/forms/send-to-parent
        /// </summary>
        [HttpPost("forms/send-to-parent")]
        public ActionResult SendFormToParent([FromBody] SendToParentRequest request)
        {
            try
            {
                if (request.KidId <= 0 || request.FormId <= 0)
                {
                    return BadRequest("מזהה ילד ומזהה טופס חייבים להיות חיוביים");
                }

                bool success = _onboardingService.SendFormToParent(request.KidId, request.FormId);

                if (success)
                {
                    return Ok(new { Message = "טופס נשלח להורים בהצלחה" });
                }
                else
                {
                    return BadRequest("לא ניתן לשלוח את הטופס");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליחת טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת סטטוס טופס ספציפי
        /// GET: api/Onboarding/forms/5/status/10
        /// </summary>
        [HttpGet("forms/{formId}/status/{kidId}")]
        public ActionResult<FormStatusDto> GetFormStatus(int formId, int kidId)
        {
            try
            {
                var onboardingStatus = _onboardingService.GetOnboardingStatus(kidId);

                if (onboardingStatus == null)
                {
                    return NotFound("לא נמצא תהליך קליטה עבור הילד");
                }

                var formStatus = onboardingStatus.Forms.Find(f => f.FormId == formId);

                if (formStatus == null)
                {
                    return NotFound("לא נמצא טופס זה בתהליך הקליטה");
                }

                return Ok(formStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת סטטוס הטופס: {ex.Message}");
            }
        }

        #endregion

        #region תזכורות

        /// <summary>
        /// קבלת כל התזכורות של ילד
        /// GET: api/Onboarding/reminders/5
        /// </summary>
        [HttpGet("reminders/{kidId}")]
        public ActionResult<List<OnboardingReminderDto>> GetReminders(int kidId)
        {
            try
            {
                var status = _onboardingService.GetOnboardingStatus(kidId);

                if (status == null)
                {
                    return NotFound($"לא נמצא תהליך קליטה עבור ילד {kidId}");
                }

                return Ok(status.Reminders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת תזכורות: {ex.Message}");
            }
        }

        /// <summary>
        /// הוספת תזכורת ידנית
        /// POST: api/Onboarding/reminders
        /// </summary>
        [HttpPost("reminders")]
        public ActionResult AddReminder([FromBody] AddReminderRequest request)
        {
            try
            {
                // TODO: מימוש הוספת תזכורת
                return Ok(new { Message = "תזכורת נוספה בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהוספת תזכורת: {ex.Message}");
            }
        }

        /// <summary>
        /// סימון תזכורת כהושלמה
        /// PUT: api/Onboarding/reminders/5/complete
        /// </summary>
        [HttpPut("reminders/{reminderId}/complete")]
        public ActionResult CompleteReminder(int reminderId)
        {
            try
            {
                // TODO: מימוש השלמת תזכורת
                return Ok(new { Message = "תזכורת סומנה כהושלמה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהשלמת תזכורת: {ex.Message}");
            }
        }

        #endregion

        #region דוחות וסטטיסטיקות

        /// <summary>
        /// קבלת רשימת כל התהליכים הפעילים
        /// GET: api/Onboarding/active-processes
        /// </summary>
        [HttpGet("active-processes")]
        public ActionResult<List<object>> GetActiveProcesses()
        {
            try
            {
                // TODO: מימוש קבלת תהליכים פעילים
                return Ok(new List<object>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת תהליכים פעילים: {ex.Message}");
            }
        }

        /// <summary>
        /// דוח סטטיסטיקות כללי
        /// GET: api/Onboarding/statistics
        /// </summary>
        [HttpGet("statistics")]
        public ActionResult<object> GetStatistics()
        {
            try
            {
                // TODO: מימוש סטטיסטיקות כלליות
                return Ok(new { Message = "סטטיסטיקות" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בקבלת סטטיסטיקות: {ex.Message}");
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// קבלת מזהה המשתמש הנוכחי מה-JWT token
        /// </summary>
        private int? GetCurrentUserId()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (int.TryParse(userIdClaim, out int userId))
                {
                    return userId;
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        #endregion
    }

    #region Request Models

    public class StartOnboardingRequest
    {
        public int KidId { get; set; }
        public string Notes { get; set; }
    }

    public class StartFormRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public int? AssignedTo { get; set; }
    }

    public class UpdateProgressRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
    }

    public class CompleteFormRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public string Notes { get; set; }
    }

    public class SendToParentRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public string ParentEmail { get; set; }
        public string ParentPhone { get; set; }
        public string Message { get; set; }
    }

    public class AddReminderRequest
    {
        public int KidId { get; set; }
        public int? FormId { get; set; }
        public string ReminderType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedTo { get; set; }
    }

    #endregion
}
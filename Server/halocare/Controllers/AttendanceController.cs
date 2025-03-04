using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;

        public AttendanceController(IConfiguration configuration)
        {
            _attendanceService = new AttendanceService(configuration);
        }

        // GET: api/Attendance
        [HttpGet]
        public ActionResult<IEnumerable<Attendance>> GetAllAttendance()
        {
            try
            {
                return Ok(_attendanceService.GetAllAttendances());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Attendance/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<Attendance>> GetAttendanceByKidId(int kidId)
        {
            try
            {
                return Ok(_attendanceService.GetAttendancesByKidId(kidId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Attendance/date/2023-05-15
        [HttpGet("date/{date}")]
        public ActionResult<IEnumerable<Attendance>> GetAttendanceByDate(DateTime date)
        {
            try
            {
                return Ok(_attendanceService.GetAttendancesByDate(date));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Attendance/monthly-summary/2023/5
        [HttpGet("monthly-summary/{year}/{month}")]
        public ActionResult<Dictionary<DateTime, int>> GetMonthlyAttendanceSummary(int year, int month)
        {
            try
            {
                var summary = _attendanceService.GetMonthlyAttendanceSummary(month, year);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Attendance
        [HttpPost]
        public ActionResult<Attendance> PostAttendance(Attendance attendance)
        {
            try
            {
                int attendanceId = _attendanceService.AddAttendance(attendance);
                attendance.AttendanceId = attendanceId;

                return CreatedAtAction(nameof(GetAttendanceByKidId), new { kidId = attendance.KidId }, attendance);
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

        // PUT: api/Attendance/5
        [HttpPut("{id}")]
        public IActionResult PutAttendance(int id, Attendance attendance)
        {
            if (id != attendance.AttendanceId)
            {
                return BadRequest("מזהה הנוכחות בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _attendanceService.UpdateAttendance(attendance);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"רשומת נוכחות עם מזהה {id} לא נמצאה");
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
}
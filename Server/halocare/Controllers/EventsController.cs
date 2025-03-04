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
    public class EventsController : ControllerBase
    {
        private readonly EventService _eventService;

        public EventsController(IConfiguration configuration)
        {
            _eventService = new EventService(configuration);
        }

        // GET: api/Events
        [HttpGet]
        public ActionResult<IEnumerable<Event>> GetEvents()
        {
            try
            {
                return Ok(_eventService.GetAllEvents());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public ActionResult<Event> GetEvent(int id)
        {
            try
            {
                var eventItem = _eventService.GetEventById(id);

                if (eventItem == null)
                {
                    return NotFound($"אירוע עם מזהה {id} לא נמצא");
                }

                return Ok(eventItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Events/range?startDate=2023-05-01&endDate=2023-05-31
        [HttpGet("range")]
        public ActionResult<IEnumerable<Event>> GetEventsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                return Ok(_eventService.GetEventsByDateRange(startDate, endDate));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Events/5/kids
        [HttpGet("{id}/kids")]
        public ActionResult<IEnumerable<Kid>> GetEventKids(int id)
        {
            try
            {
                var kids = _eventService.GetEventKids(id);
                return Ok(kids);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Events/5/employees
        [HttpGet("{id}/employees")]
        public ActionResult<IEnumerable<Employee>> GetEventEmployees(int id)
        {
            try
            {
                var employees = _eventService.GetEventEmployees(id);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Events
        [HttpPost]
        public ActionResult<Event> PostEvent([FromBody] EventCreateModel model)
        {
            try
            {
                int eventId = _eventService.AddEvent(model.Event, model.KidIds, model.EmployeeIds);
                model.Event.EventId = eventId;

                return CreatedAtAction(nameof(GetEvent), new { id = eventId }, model.Event);
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

        // PUT: api/Events/5
        [HttpPut("{id}")]
        public IActionResult PutEvent(int id, [FromBody] EventCreateModel model)
        {
            if (id != model.Event.EventId)
            {
                return BadRequest("מזהה האירוע בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _eventService.UpdateEvent(model.Event, model.KidIds, model.EmployeeIds);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"אירוע עם מזהה {id} לא נמצא");
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

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        public IActionResult DeleteEvent(int id)
        {
            try
            {
                bool deleted = _eventService.DeleteEvent(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"אירוע עם מזהה {id} לא נמצא");
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

    public class EventCreateModel
    {
        public Event Event { get; set; }
        public List<int> KidIds { get; set; }
        public List<int> EmployeeIds { get; set; }
    }
}
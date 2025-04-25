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

    public class EventTypesController : ControllerBase
    {
        private readonly EventService _eventService;

        public EventTypesController(IConfiguration configuration)
        {
            _eventService = new EventService(configuration);
        }

        // GET: api/EventTypes
        [HttpGet]
        public ActionResult<IEnumerable<EventTypes>> GetEventTypes()
        {
            try
            {
                return Ok(_eventService.GetAllEventTypes());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/EventTypes/5
        [HttpGet("{id}")]
        public ActionResult<EventTypes> GetEventType(int id)
        {
            try
            {
                var eventType = _eventService.GetEventTypeById(id);

                if (eventType == null)
                {
                    return NotFound($"סוג אירוע עם מזהה {id} לא נמצא");
                }

                return Ok(eventType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/EventTypes
        [HttpPost]
        public ActionResult<EventTypes> PostEventType(EventTypes eventType)
        {
            try
            {
                int eventTypeId = _eventService.AddEventType(eventType);
                eventType.EventTypeId = eventTypeId;

                return CreatedAtAction(nameof(GetEventType), new { id = eventTypeId }, eventType);
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

        // PUT: api/EventTypes/5
        [HttpPut("{id}")]
        public IActionResult PutEventType(int id, EventTypes eventType)
        {
            if (id != eventType.EventTypeId)
            {
                return BadRequest("מזהה סוג האירוע בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _eventService.UpdateEventType(eventType);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"סוג אירוע עם מזהה {id} לא נמצא");
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

        // DELETE: api/EventTypes/5
        [HttpDelete("{id}")]
        public IActionResult DeleteEventType(int id)
        {
            try
            {
                bool deleted = _eventService.DeleteEventType(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"סוג אירוע עם מזהה {id} לא נמצא");
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

        // GET: api/EventTypes/name/{name}
        [HttpGet("name/{name}")]
        public ActionResult<EventTypes> GetEventTypeByName(string name)
        {
            try
            {
                var eventType = _eventService.GetEventTypeByName(name);

                if (eventType == null)
                {
                    return NotFound($"סוג אירוע בשם '{name}' לא נמצא");
                }

                return Ok(eventType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }


    }
}
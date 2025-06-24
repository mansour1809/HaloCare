using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http.Features;

namespace halocare.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Logging the incoming request
                LogIncomingRequest(context);

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred during request processing");
                await HandleExceptionAsync(context, ex);
            }
        }

        private void LogIncomingRequest(HttpContext context)
        {
            var request = context.Request;
            _logger.LogInformation(
                "Processing {Method} request to {Path} from {RemoteIp}. Content-Type: {ContentType}, Content-Length: {ContentLength}",
                request.Method,
                request.Path,
                context.Connection.RemoteIpAddress,
                request.ContentType,
                request.ContentLength
            );

            // Special logging for file upload requests
            if (request.ContentType?.Contains("multipart/form-data") == true)
            {
                _logger.LogInformation("File upload request detected. Content-Length: {ContentLength} bytes", request.ContentLength);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorResponse();

            switch (exception)
            {
                case ArgumentException argEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = argEx.Message;
                    errorResponse.Details = "Invalid argument provided";
                    _logger.LogWarning(argEx, "Argument exception: {Message}", argEx.Message);
                    break;

                //case ArgumentNullException nullEx:
                //    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                //    errorResponse.Message = $"Required parameter '{nullEx.ParamName}' is missing";
                //    errorResponse.Details = nullEx.Message;
                //    _logger.LogWarning(nullEx, "Null argument exception: {ParamName}", nullEx.ParamName);
                //    break;

                case FileNotFoundException fileEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = "הקובץ המבוקש לא נמצא";
                    errorResponse.Details = fileEx.Message;
                    _logger.LogWarning(fileEx, "File not found: {FileName}", fileEx.FileName);
                    break;

                case IOException ioEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "שגיאה בקריאה/כתיבה של קובץ";
                    errorResponse.Details = ioEx.Message;
                    _logger.LogError(ioEx, "IO exception occurred: {Message}", ioEx.Message);
                    break;

                case UnauthorizedAccessException unauthorizedEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.Forbidden;
                    errorResponse.Message = "אין הרשאה לגשת למשאב זה";
                    errorResponse.Details = unauthorizedEx.Message;
                    _logger.LogWarning(unauthorizedEx, "Unauthorized access attempt");
                    break;

                case InvalidDataException invalidDataEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "נתונים לא תקינים";
                    errorResponse.Details = invalidDataEx.Message;
                    _logger.LogWarning(invalidDataEx, "Invalid data provided: {Message}", invalidDataEx.Message);
                    break;

                //case BadHttpRequestException badRequestEx:
                //    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                //    errorResponse.Message = "בקשה לא תקינה";
                //    errorResponse.Details = badRequestEx.Message;
                //    _logger.LogWarning(badRequestEx, "Bad HTTP request: {Message}", badRequestEx.Message);
                //    break;

                case InvalidOperationException invalidOpEx when invalidOpEx.Message.Contains("Multipart"):
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "שגיאה בעיבוד קובץ שהועלה";
                    errorResponse.Details = "הקובץ לא תקין או גדול מדי";
                    _logger.LogError(invalidOpEx, "Multipart processing error: {Message}", invalidOpEx.Message);
                    break;

                case OutOfMemoryException memEx:
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "הקובץ גדול מדי לעיבוד";
                    errorResponse.Details = "אנא נסה קובץ קטן יותר";
                    _logger.LogError(memEx, "Out of memory while processing request");
                    break;

                case TaskCanceledException taskEx when taskEx.InnerException is TimeoutException:
                    errorResponse.StatusCode = (int)HttpStatusCode.RequestTimeout;
                    errorResponse.Message = "הבקשה לקחה זמן רב מדי";
                    errorResponse.Details = "נסה שוב עם קובץ קטן יותר";
                    _logger.LogWarning(taskEx, "Request timeout occurred");
                    break;

                case Exception generalEx when generalEx.Message.Contains("maximum request body size"):
                    errorResponse.StatusCode = (int)HttpStatusCode.RequestEntityTooLarge;
                    errorResponse.Message = "הקובץ גדול מדי";
                    errorResponse.Details = "גודל הקובץ המקסימלי הוא 50MB";
                    _logger.LogWarning(generalEx, "Request body too large");
                    break;

                default:
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "אירעה שגיאה פנימית בשרת";
                    errorResponse.Details = "אנא נסה שוב מאוחר יותר";
                    _logger.LogError(exception, "Unhandled exception occurred: {ExceptionType} - {Message}",
                        exception.GetType().Name, exception.Message);
                    break;
            }

            response.StatusCode = errorResponse.StatusCode;

            // Add headers for debugging purposes
            if (!response.Headers.ContainsKey("X-Error-Type"))
            {
                response.Headers.Add("X-Error-Type", exception.GetType().Name);
            }

            var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });

            await response.WriteAsync(jsonResponse);
        }
    }

    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string RequestId { get; set; } = Guid.NewGuid().ToString();
    }
}

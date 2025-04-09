// התקן את החבילה: Mailjet.Api
using Mailjet.Client;
using Mailjet.Client.Resources;
using Newtonsoft.Json.Linq;

public class EmailService
{
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration)
    {
        _apiKey = configuration["Mailjet:ApiKey"];
        _apiSecret = configuration["Mailjet:ApiSecret"];
        _fromEmail = configuration["Mailjet:FromEmail"];
        _fromName = configuration["Mailjet:FromName"];
    }

    public async Task<bool> SendWelcomeEmail(string email, string password, string firstName, string lastName, string loginUrl)
    {
        MailjetClient client = new MailjetClient(_apiKey, _apiSecret);

        string autoLoginLink = $"{loginUrl}?email={Uri.EscapeDataString(email)}";

        MailjetRequest request = new MailjetRequest
        {
            Resource = Send.Resource,
        }
        .Property(Send.FromEmail, _fromEmail)
        .Property(Send.FromName, _fromName)
        .Property(Send.Subject, "ברוך הבא למערכת גן הילד")
        .Property(Send.HtmlPart, $@"
            <div dir='rtl'>
                <h2>שלום {firstName} {lastName},</h2>
                <p>נוצר עבורך חשבון במערכת גן הילד.</p>
                <p>פרטי התחברות:</p>
                <ul>
                    <li>שם משתמש: {email}</li>
                    <li>סיסמה: {password}</li>
                </ul>
                <p><a href='{autoLoginLink}'>לחץ כאן להתחברות למערכת</a></p>
            </div>")
        .Property(Send.Recipients, new JArray {
            new JObject {
                {"Email", email}
            }
        });

        MailjetResponse response = await client.PostAsync(request);
        return response.IsSuccessStatusCode;
    }
}
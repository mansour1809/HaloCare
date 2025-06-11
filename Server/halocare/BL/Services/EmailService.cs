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
    public async Task<bool> SendPasswordResetEmail(string email, string resetToken, string resetUrl)
    {
        MailjetClient client = new MailjetClient(_apiKey, _apiSecret);
        string resetLink = $"{resetUrl}?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(resetToken)}";
        MailjetRequest request = new MailjetRequest
        {
            Resource = Send.Resource,
        }
        .Property(Send.FromEmail, _fromEmail)
        .Property(Send.FromName, _fromName)
        .Property(Send.Subject, "איפוס סיסמה למערכת גן הילד")
        .Property(Send.HtmlPart, $@"
        <div dir='rtl'>
            <h2>שלום,</h2>
            <p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת גן הילד.</p>
            <p>לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:</p>
            <p><a href='{resetLink}'>לחץ כאן לאיפוס סיסמה</a></p>
            <p>הקישור יהיה בתוקף למשך שעה אחת.</p>
            <p>אם לא ביקשת לאפס את הסיסמה שלך, אנא התעלם מהודעה זו.</p>
        </div>")
        .Property(Send.Recipients, new JArray {
        new JObject {
            {"Email", email}
        }
        });

        MailjetResponse response = await client.PostAsync(request);
        return response.IsSuccessStatusCode;
    }
    public async Task<bool> SendFormToParent(string parentEmail, string parentName, string kidName,
    string formName, string parentFormUrl, string kidIdNumber)
    {
        MailjetClient client = new MailjetClient(_apiKey, _apiSecret);

        // הודעה בעברית עם הסבר על הצורך בתעודת זהות
        MailjetRequest request = new MailjetRequest
        {
            Resource = Send.Resource,
        }
        .Property(Send.FromEmail, _fromEmail)
        .Property(Send.FromName, _fromName)
        .Property(Send.Subject, $"טופס {formName} עבור {kidName} - גן הילד")
        .Property(Send.HtmlPart, $@"
        <div dir='rtl' style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #2196F3;'>שלום {parentName},</h2>
            
            <p>התקבל טופס <strong>{formName}</strong> למילוי עבור {kidName}.</p>
            
            <div style='background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <h3 style='color: #666; margin-top: 0;'>הוראות למילוי:</h3>
                <ol>
                    <li>לחץ על הקישור למטה</li>
                    <li>הזן את תעודת הזהות של הילד/ה לאימות</li>
                    <li>מלא את הטופס (תוכל לראות תשובות קיימות אם יש)</li>
                    <li>שמור את הטופס בסיום</li>
                </ol>
            </div>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{parentFormUrl}' 
                   style='background-color: #4CAF50; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;'>
                    למילוי הטופס - לחץ כאן
                </a>
            </div>
            
            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 20px 0;'>
                <strong>חשוב:</strong> לצורכי אבטחה, תתבקש להזין את תעודת הזהות של הילד/ה.
            </div>
            
            <p style='color: #666; font-size: 14px;'>
                הקישור בתוקף למשך 7 ימים.<br/>
                לשאלות ובעיות, צור קשר עם המעון: [מספר טלפון]
            </p>
            
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'/>
            <p style='color: #999; font-size: 12px; text-align: center;'>
                הודעה זו נשלחה ממערכת גן הילד
            </p>
        </div>")
        .Property(Send.Recipients, new JArray {
        new JObject {
            {"Email", parentEmail},
            {"Name", parentName}
        }
        });

        MailjetResponse response = await client.PostAsync(request);
        return response.IsSuccessStatusCode;
    }
}
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

using halocare.BL.Services;
using halocare.Middleware;
using Microsoft.Extensions.FileProviders;
using halocare.DAL.Models;
using Mailjet.Client.Resources;
using halocare.DAL.Repositories;


namespace halocare
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddScoped<EmailService>();

            var configuration = builder.Configuration;
            string jwtIssuer = configuration["Jwt:Issuer"];
            string jwtAudience = configuration["Jwt:Audience"];
            string jwtKey = configuration["Jwt:Key"];

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtIssuer,
                        ValidAudience = jwtAudience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                    };
                });


            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddSingleton<TreatmentInsightService>();

            builder.Services.AddScoped<IKidOnboardingRepository, KidOnboardingRepository>();
            builder.Services.AddScoped<IKidOnboardingService, KidOnboardingService>();

            builder.Services.AddScoped<KidRepository>();
            builder.Services.AddScoped<AnswerToQuestionRepository>();
            builder.Services.AddScoped<ParentService>(); // אם זה לא רשום כבר

            builder.Services.AddScoped<FormService>();
            builder.Services.AddScoped<EmailService>();
            builder.Services.AddScoped<KidOnboardingService>();

            builder.Services.AddScoped<ParentFormService>();





            builder.Services.AddHttpClient();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (true)
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseMiddleware<ErrorHandlingMiddleware>();
            app.UseHttpsRedirection();
            app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
                RequestPath = "/uploads"
            });
            app.Run();
        }
    }
}

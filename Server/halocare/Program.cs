using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using halocare.BL.Services;
using Microsoft.Extensions.FileProviders;
using halocare.BL.Services;
using halocare.Middleware;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // הוספת שירותים לקונטיינר
        builder.Services.AddControllers();

        // הוספת Swagger
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Gan Hayeled API",
                Version = "v1",
                Description = "API for Gan Hayeled digital management system"
            });

            // הוספת תמיכה בהגדרת JWT ב-Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
            });
        });

        // הגדרת פרמטרי JWT Authentication
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
        });

        // רישום השירותים
        builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
        builder.Services.AddScoped<KidService>();
        builder.Services.AddScoped<EmployeeService>();
        builder.Services.AddScoped<ParentService>();
        builder.Services.AddScoped<ClassService>();
        builder.Services.AddScoped<TreatmentService>();
        builder.Services.AddScoped<AttendanceService>();
        builder.Services.AddScoped<AlertService>();
        builder.Services.AddScoped<EventService>();
        builder.Services.AddScoped<TSHAService>();
        builder.Services.AddScoped<FormService>();
        builder.Services.AddScoped<DocumentService>();
        builder.Services.AddScoped<HomeVisitService>();
        builder.Services.AddScoped<TranslationService>();
        builder.Services.AddScoped<ReferenceDataService>();

        // הוספת תמיכה ב-CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy.WithOrigins("http://localhost:3000") // כתובת ה-React App
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

        // Configure middleware
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();

        // הוספת תיקייה לאחסון מסמכים
        string documentsPath = Path.Combine(Directory.GetCurrentDirectory(), "Documents");
        if (!Directory.Exists(documentsPath))
        {
            Directory.CreateDirectory(documentsPath);
        }

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(documentsPath),
            RequestPath = "/documents"
        });

        app.UseMiddleware<ErrorHandlingMiddleware>();

        app.UseCors("AllowReactApp");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
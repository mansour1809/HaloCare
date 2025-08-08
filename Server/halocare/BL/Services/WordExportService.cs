using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Linq;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

// Alias to avoid conflicts
using WordText = DocumentFormat.OpenXml.Wordprocessing.Text;

namespace halocare.BL.Services
{
    public class WordExportService
    {
        private readonly string _tempPath;

        public WordExportService(IConfiguration configuration)
        {
            _tempPath = configuration.GetValue<string>("TempFilesPath") ?? Path.GetTempPath();
        }

        public byte[] GenerateWordDocument(TasheReport report)
        {
            // יצירת קובץ זמני
            string tempFilePath = Path.Combine(_tempPath, $"tashe_report_{report.ReportId}_{Guid.NewGuid()}.docx");

            try
            {
                // יצירת מסמך Word
                using (WordprocessingDocument wordDocument = WordprocessingDocument.Create(tempFilePath, WordprocessingDocumentType.Document))
                {
                    // הוספת חלקי המסמך הראשיים
                    MainDocumentPart mainPart = wordDocument.AddMainDocumentPart();
                    mainPart.Document = new Document();
                    Body body = mainPart.Document.AppendChild(new Body());

                    // הוספת עמוד כותרת
                    AddTitlePage(body, report);

                    // עיבוד תוכן הדוח והוספתו למסמך
                    ProcessReportContent(body, report.ReportContent);

                    // הוספת כותרת עליונה ותחתונה
                    AddHeaderAndFooter(mainPart, report);

                    // שמירת המסמך
                    mainPart.Document.Save();
                }

                // קריאת הקובץ והחזרתו כ-byte array
                byte[] fileBytes = File.ReadAllBytes(tempFilePath);
                return fileBytes;
            }
            finally
            {
                // מחיקת הקובץ הזמני
                if (File.Exists(tempFilePath))
                {
                    try
                    {
                        File.Delete(tempFilePath);
                    }
                    catch
                    {
                        // התעלמות משגיאות מחיקה
                    }
                }
            }
        }

        private void AddTitlePage(Body body, TasheReport report)
        {
            // כותרת ראשית - מרכז העמוד
            Paragraph titleParagraph = new Paragraph();
            titleParagraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center },
                new SpacingBetweenLines() { Before = "720", After = "720" } // 36pt לפני ואחרי
            ));

            Run titleRun = new Run();
            titleRun.AppendChild(new RunProperties(
                new Bold(),
                new FontSize() { Val = "32" }, // 16pt
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            titleRun.AppendChild(new WordText("דוח תש\"ה"));
            titleParagraph.AppendChild(titleRun);
            body.AppendChild(titleParagraph);

            // כותרת משנה
            Paragraph subtitleParagraph = new Paragraph();
            subtitleParagraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center },
                new SpacingBetweenLines() { After = "480" }
            ));

            Run subtitleRun = new Run();
            subtitleRun.AppendChild(new RunProperties(
                new FontSize() { Val = "24" }, // 12pt
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            subtitleRun.AppendChild(new WordText("תוכנית שיקומית התפתחותית"));
            subtitleParagraph.AppendChild(subtitleRun);
            body.AppendChild(subtitleParagraph);

            // פרטי הדוח
            AddDetailLine(body, "שם הילד:", report.KidName ?? "לא צוין");
            AddDetailLine(body, "תקופת הדוח:", $"{report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}");
            AddDetailLine(body, "תאריך יצירה:", report.GeneratedDate.ToString("dd/MM/yyyy"));
            AddDetailLine(body, "נוצר על ידי:", report.GeneratedByEmployeeName ?? "לא צוין");

            if (report.IsApproved)
            {
                AddDetailLine(body, "סטטוס:", "מאושר");
                if (report.ApprovedDate.HasValue)
                {
                    AddDetailLine(body, "תאריך אישור:", report.ApprovedDate.Value.ToString("dd/MM/yyyy"));
                }
                if (!string.IsNullOrEmpty(report.ApprovedByEmployeeName))
                {
                    AddDetailLine(body, "אושר על ידי:", report.ApprovedByEmployeeName);
                }
            }
            else
            {
                AddDetailLine(body, "סטטוס:", "ממתין לאישור");
            }

            // מעבר עמוד
            body.AppendChild(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
        }

        private void AddDetailLine(Body body, string label, string value)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Right },
                new SpacingBetweenLines() { After = "120" }
            ));

            // התווית (מודגשת)
            Run labelRun = new Run();
            labelRun.AppendChild(new RunProperties(
                new Bold(),
                new FontSize() { Val = "22" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            labelRun.AppendChild(new WordText($"{label} "));

            // הערך
            Run valueRun = new Run();
            valueRun.AppendChild(new RunProperties(
                new FontSize() { Val = "22" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            valueRun.AppendChild(new WordText(value));

            paragraph.AppendChild(labelRun);
            paragraph.AppendChild(valueRun);
            body.AppendChild(paragraph);
        }

        private void ProcessReportContent(Body body, string content)
        {
            if (string.IsNullOrEmpty(content))
            {
                AddParagraph(body, "תוכן הדוח לא זמין.", false);
                return;
            }

            // פיצול התוכן לשורות
            string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.None);

            foreach (string line in lines)
            {
                string trimmedLine = line.Trim();

                if (string.IsNullOrEmpty(trimmedLine))
                {
                    // שורה ריקה
                    AddEmptyParagraph(body);
                    continue;
                }

                // זיהוי כותרות
                if (IsMainHeading(trimmedLine))
                {
                    AddHeading(body, trimmedLine, 1);
                }
                else if (IsSubHeading(trimmedLine))
                {
                    AddHeading(body, trimmedLine, 2);
                }
                else if (IsSubSubHeading(trimmedLine))
                {
                    AddHeading(body, trimmedLine, 3);
                }
                else if (IsBoldText(trimmedLine))
                {
                    AddParagraph(body, CleanBoldText(trimmedLine), true);
                }
                else if (IsBulletPoint(trimmedLine))
                {
                    AddBulletPoint(body, CleanBulletText(trimmedLine));
                }
                else
                {
                    // פסקה רגילה
                    AddParagraph(body, trimmedLine, false);
                }
            }
        }

        private bool IsMainHeading(string line)
        {
            return line.StartsWith("# ") || line.StartsWith("## ");
        }

        private bool IsSubHeading(string line)
        {
            return line.StartsWith("### ");
        }

        private bool IsSubSubHeading(string line)
        {
            return line.StartsWith("#### ");
        }

        private bool IsBoldText(string line)
        {
            return line.StartsWith("**") && line.EndsWith("**") && line.Length > 4;
        }

        private bool IsBulletPoint(string line)
        {
            return line.StartsWith("• ") || line.StartsWith("- ") || line.StartsWith("* ");
        }

        private string CleanBoldText(string line)
        {
            return line.Substring(2, line.Length - 4); // הסרת ** מההתחלה והסוף
        }

        private string CleanBulletText(string line)
        {
            if (line.StartsWith("• ")) return line.Substring(2);
            if (line.StartsWith("- ")) return line.Substring(2);
            if (line.StartsWith("* ")) return line.Substring(2);
            return line;
        }

        private void AddHeading(Body body, string text, int level)
        {
            string cleanText = text.TrimStart('#', ' ');

            Paragraph paragraph = new Paragraph();

            // הגדרת סגנון לפי רמה
            ParagraphProperties props = new ParagraphProperties(
                new Justification() { Val = JustificationValues.Right }
            );

            string fontSize = level switch
            {
                1 => "28", // 14pt
                2 => "26", // 13pt
                3 => "24", // 12pt
                _ => "22"  // 11pt
            };

            props.AppendChild(new SpacingBetweenLines()
            {
                Before = level == 1 ? "480" : "360",
                After = level == 1 ? "240" : "180"
            });

            paragraph.AppendChild(props);

            Run run = new Run();
            run.AppendChild(new RunProperties(
                new Bold(),
                new FontSize() { Val = fontSize },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" },
                new Color() { Val = level == 1 ? "2F5496" : "1F3864" } // כחול כהה יותר לכותרות עיקריות
            ));
            run.AppendChild(new WordText(cleanText));

            paragraph.AppendChild(run);
            body.AppendChild(paragraph);
        }

        private void AddParagraph(Body body, string text, bool isBold)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Right },
                new SpacingBetweenLines() { After = "120" }
            ));

            Run run = new Run();
            RunProperties runProps = new RunProperties(
                new FontSize() { Val = "22" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            );

            if (isBold)
            {
                runProps.AppendChild(new Bold());
            }

            run.AppendChild(runProps);
            run.AppendChild(new WordText(text));

            paragraph.AppendChild(run);
            body.AppendChild(paragraph);
        }

        private void AddBulletPoint(Body body, string text)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Right },
                new SpacingBetweenLines() { After = "60" },
                new Indentation() { Right = "720" } // הזחה 
            ));

            // סימן התבליט
            Run bulletRun = new Run();
            bulletRun.AppendChild(new RunProperties(
                new FontSize() { Val = "22" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            bulletRun.AppendChild(new WordText("• "));

            // הטקסט
            Run textRun = new Run();
            textRun.AppendChild(new RunProperties(
                new FontSize() { Val = "22" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" }
            ));
            textRun.AppendChild(new WordText(text));

            paragraph.AppendChild(bulletRun);
            paragraph.AppendChild(textRun);
            body.AppendChild(paragraph);
        }

        private void AddEmptyParagraph(Body body)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(new Run(new WordText("")));
            body.AppendChild(paragraph);
        }

        private void AddHeaderAndFooter(MainDocumentPart mainPart, TasheReport report)
        {
            // הוספת כותרת עליונה
            HeaderPart headerPart = mainPart.AddNewPart<HeaderPart>();
            headerPart.Header = new Header();

            Paragraph headerParagraph = new Paragraph();
            headerParagraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center }
            ));

            Run headerRun = new Run();
            headerRun.AppendChild(new RunProperties(
                new FontSize() { Val = "20" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" },
                new Color() { Val = "7F7F7F" }
            ));
            headerRun.AppendChild(new WordText("גן הילד - חיפה | דוח תש\"ה"));

            headerParagraph.AppendChild(headerRun);
            headerPart.Header.AppendChild(headerParagraph);

            // הוספת כותרת תחתונה
            FooterPart footerPart = mainPart.AddNewPart<FooterPart>();
            footerPart.Footer = new Footer();

            Paragraph footerParagraph = new Paragraph();
            footerParagraph.AppendChild(new ParagraphProperties(
                new Justification() { Val = JustificationValues.Center }
            ));

            Run footerRun = new Run();
            footerRun.AppendChild(new RunProperties(
                new FontSize() { Val = "18" },
                new RunFonts() { Ascii = "Arial", HighAnsi = "Arial" },
                new Color() { Val = "7F7F7F" }
            ));
            footerRun.AppendChild(new WordText($"עמוד "));

            // הוספת מספר עמוד
            footerRun.AppendChild(new FieldChar() { FieldCharType = FieldCharValues.Begin });
            footerRun.AppendChild(new FieldCode() { Text = "PAGE" });
            footerRun.AppendChild(new FieldChar() { FieldCharType = FieldCharValues.End });

            footerParagraph.AppendChild(footerRun);
            footerPart.Footer.AppendChild(footerParagraph);

            // קישור הכותרות למסמך
            SectionProperties sectionProps = mainPart.Document.Body.Elements<SectionProperties>().FirstOrDefault();
            if (sectionProps == null)
            {
                sectionProps = new SectionProperties();
                mainPart.Document.Body.AppendChild(sectionProps);
            }

            sectionProps.AppendChild(new HeaderReference()
            {
                Type = HeaderFooterValues.Default,
                Id = mainPart.GetIdOfPart(headerPart)
            });

            sectionProps.AppendChild(new FooterReference()
            {
                Type = HeaderFooterValues.Default,
                Id = mainPart.GetIdOfPart(footerPart)
            });
        }
    }
}
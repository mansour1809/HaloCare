using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Linq;
using System.Collections.Generic;
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

                    // הגדרת RTL למסמך כולו
                    SetDocumentRTL(mainPart);

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

        private void SetDocumentRTL(MainDocumentPart mainPart)
        {
            // הגדרת RTL למסמך כולו
            DocumentSettingsPart settingsPart = mainPart.AddNewPart<DocumentSettingsPart>();
            settingsPart.Settings = new Settings();

            // הוספת הגדרת RTL
            settingsPart.Settings.AppendChild(new DefaultTabStop() { Val = 708 });
            settingsPart.Settings.AppendChild(new CharacterSpacingControl() { Val = CharacterSpacingValues.DoNotCompress });
        }

        private ParagraphProperties CreateRTLParagraphProperties(JustificationValues? justification = null)
        {
            ParagraphProperties props = new ParagraphProperties();

            // הגדרת כיוון RTL
            props.AppendChild(new BiDi());

            // הגדרת יישור (ברירת מחדל: ימין)
            props.AppendChild(new Justification() { Val = justification ?? JustificationValues.Right });

            return props;
        }

        private RunProperties CreateRTLRunProperties(bool isBold = false, string fontSize = "22", string color = null)
        {
            RunProperties runProps = new RunProperties();

            // הגדרת כיוון RTL
            runProps.AppendChild(new RightToLeftText());

            // גופן תומך עברית
            runProps.AppendChild(new RunFonts()
            {
                Ascii = "David",
                HighAnsi = "David",
                ComplexScript = "David"
            });

            // גודל גופן
            runProps.AppendChild(new FontSize() { Val = fontSize });
            runProps.AppendChild(new FontSizeComplexScript() { Val = fontSize });

            // הדגשה
            if (isBold)
            {
                runProps.AppendChild(new Bold());
                runProps.AppendChild(new BoldComplexScript());
            }

            // צבע
            if (!string.IsNullOrEmpty(color))
            {
                runProps.AppendChild(new Color() { Val = color });
            }

            return runProps;
        }

        private void AddTitlePage(Body body, TasheReport report)
        {
            // כותרת ראשית - מרכז העמוד
            Paragraph titleParagraph = new Paragraph();
            var titleProps = CreateRTLParagraphProperties(JustificationValues.Center);
            titleProps.AppendChild(new SpacingBetweenLines() { Before = "720", After = "720" });
            titleParagraph.AppendChild(titleProps);

            Run titleRun = new Run();
            titleRun.AppendChild(CreateRTLRunProperties(true, "32", "2F5496"));
            titleRun.AppendChild(new WordText("דוח תש\"ה"));
            titleParagraph.AppendChild(titleRun);
            body.AppendChild(titleParagraph);

            // כותרת משנה
            Paragraph subtitleParagraph = new Paragraph();
            var subtitleProps = CreateRTLParagraphProperties(JustificationValues.Center);
            subtitleProps.AppendChild(new SpacingBetweenLines() { After = "480" });
            subtitleParagraph.AppendChild(subtitleProps);

            Run subtitleRun = new Run();
            subtitleRun.AppendChild(CreateRTLRunProperties(false, "24"));
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
            var props = CreateRTLParagraphProperties();
            props.AppendChild(new SpacingBetweenLines() { After = "120" });
            paragraph.AppendChild(props);

            // התווית (מודגשת)
            Run labelRun = new Run();
            labelRun.AppendChild(CreateRTLRunProperties(true, "22"));
            labelRun.AppendChild(new WordText($"{label} "));

            // הערך
            Run valueRun = new Run();
            valueRun.AppendChild(CreateRTLRunProperties(false, "22"));
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

            // הסרת כפילויות - נמצא את נקודת החתך ונתחיל משם
            content = RemoveDuplicateContent(content);

            // פיצול התוכן לשורות
            string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.None);

            bool inTable = false;
            List<string> tableLines = new List<string>();

            foreach (string line in lines)
            {
                string trimmedLine = line.Trim();

                if (string.IsNullOrEmpty(trimmedLine))
                {
                    // שורה ריקה
                    if (inTable)
                    {
                        // סיום טבלה
                        ProcessTable(body, tableLines);
                        tableLines.Clear();
                        inTable = false;
                    }
                    AddEmptyParagraph(body);
                    continue;
                }

                // זיהוי תחילת טבלה
                if (trimmedLine.Contains("|") && (trimmedLine.Contains("מטרות ראשוניות") ||
                    trimmedLine.Contains("המצב כיום") || trimmedLine.Contains("עדכון מטרות") ||
                    trimmedLine.Contains("---|")))
                {
                    inTable = true;
                    tableLines.Add(trimmedLine);
                    continue;
                }

                // אם אנחנו בתוך טבלה
                if (inTable)
                {
                    if (trimmedLine.Contains("|") && !trimmedLine.StartsWith("**") && trimmedLine.Length > 3)
                    {
                        tableLines.Add(trimmedLine);
                        continue;
                    }
                    else
                    {
                        // סיום טבלה
                        ProcessTable(body, tableLines);
                        tableLines.Clear();
                        inTable = false;
                        // המשך עיבוד השורה הנוכחית אם היא לא ריקה
                        if (string.IsNullOrWhiteSpace(CleanMarkdown(trimmedLine)))
                        {
                            continue;
                        }
                    }
                }

                // זיהוי כותרות
                if (IsMainHeading(trimmedLine))
                {
                    AddHeading(body, CleanMarkdown(trimmedLine), 1);
                }
                else if (IsSubHeading(trimmedLine))
                {
                    AddHeading(body, CleanMarkdown(trimmedLine), 2);
                }
                else if (IsSubSubHeading(trimmedLine))
                {
                    AddHeading(body, CleanMarkdown(trimmedLine), 3);
                }
                else if (IsBulletPoint(trimmedLine))
                {
                    AddBulletPoint(body, CleanMarkdown(CleanBulletText(trimmedLine)));
                }
                else
                {
                    // פסקה רגילה - עיבוד Markdown
                    string cleanedText = CleanMarkdown(trimmedLine);
                    if (!string.IsNullOrEmpty(cleanedText))
                    {
                        AddFormattedParagraph(body, cleanedText);
                    }
                }
            }

            // אם סיימנו עם טבלה פתוחה
            if (inTable && tableLines.Count > 0)
            {
                ProcessTable(body, tableLines);
            }
        }

        private void ProcessTable(Body body, List<string> tableLines)
        {
            if (tableLines.Count < 2) return; // צריך לפחות כותרת ושורת הפרדה

            // יצירת טבלה
            Table table = new Table();

            // יצירת סגנון טבלה
            TableProperties tableProps = new TableProperties();

            // רוחב טבלה - 100%
            tableProps.AppendChild(new TableWidth() { Type = TableWidthUnitValues.Pct, Width = "5000" });

            // יישור טבלה לימין
            tableProps.AppendChild(new TableJustification() { Val = TableRowAlignmentValues.Right });

            // גבולות טבלה
            TableBorders borders = new TableBorders();
            borders.AppendChild(new TopBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            borders.AppendChild(new BottomBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            borders.AppendChild(new LeftBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            borders.AppendChild(new RightBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            borders.AppendChild(new InsideHorizontalBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            borders.AppendChild(new InsideVerticalBorder() { Val = BorderValues.Single, Size = 6, Color = "000000" });
            tableProps.AppendChild(borders);

            table.AppendChild(tableProps);

            // עיבוד שורות הטבלה
            for (int i = 0; i < tableLines.Count; i++)
            {
                string line = tableLines[i];

                // דילוג על שורת ההפרדה (---|---|---)
                if (line.Contains("---")) continue;

                // פיצול השורה לעמודות
                string[] cells = line.Split('|').Where(c => !string.IsNullOrWhiteSpace(c)).ToArray();

                if (cells.Length == 0) continue;

                // יצירת שורה בטבלה
                TableRow row = new TableRow();

                // הגדרת גובה שורה
                TableRowProperties rowProps = new TableRowProperties();
                rowProps.AppendChild(new TableRowHeight() { Val = 600, HeightType = HeightRuleValues.AtLeast });
                row.AppendChild(rowProps);

                foreach (string cellText in cells)
                {
                    TableCell cell = new TableCell();

                    // הגדרות התא
                    TableCellProperties cellProps = new TableCellProperties();
                    cellProps.AppendChild(new TableCellWidth() { Type = TableWidthUnitValues.Pct, Width = "1666" }); // חלוקה שווה

                    // רקע לכותרת
                    if (i == 0) // שורת כותרת
                    {
                        cellProps.AppendChild(new Shading() { Val = ShadingPatternValues.Clear, Fill = "D9E2F3" });
                    }

                    // הסרתי את TextDirection - זה גרם לסיבוב

                    cell.AppendChild(cellProps);

                    // תוכן התא
                    Paragraph cellPara = new Paragraph();

                    // הגדרות הפסקה בתא
                    ParagraphProperties cellParaProps = CreateRTLParagraphProperties(JustificationValues.Right);
                    cellParaProps.AppendChild(new SpacingBetweenLines() { After = "60", Before = "60" });
                    cellPara.AppendChild(cellParaProps);

                    // טקסט התא
                    string cleanCellText = CleanMarkdown(cellText.Trim());

                    // החלפת <br> בשבירות שורה אמיתיות
                    if (cleanCellText.Contains("<br>"))
                    {
                        string[] parts = cleanCellText.Split(new[] { "<br>", "<br />", "<br/>" }, StringSplitOptions.None);
                        for (int j = 0; j < parts.Length; j++)
                        {
                            if (j > 0)
                            {
                                cellPara.AppendChild(new Run(new Break()));
                            }

                            Run cellRun = new Run();
                            cellRun.AppendChild(CreateRTLRunProperties(i == 0, "20")); // כותרות מודגשות
                            cellRun.AppendChild(new WordText(parts[j].Trim()));
                            cellPara.AppendChild(cellRun);
                        }
                    }
                    else
                    {
                        Run cellRun = new Run();
                        cellRun.AppendChild(CreateRTLRunProperties(i == 0, "20")); // כותרות מודגשות
                        cellRun.AppendChild(new WordText(cleanCellText));
                        cellPara.AppendChild(cellRun);
                    }

                    cell.AppendChild(cellPara);
                    row.AppendChild(cell);
                }

                table.AppendChild(row);
            }

            body.AppendChild(table);

            // הוספת רווח אחרי הטבלה
            AddEmptyParagraph(body);
        }

        private string RemoveDuplicateContent(string content)
        {
            // מחפש את הנקודה שבה מתחיל התוכן האמיתי (אחרי הכפילות)
            string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);

            for (int i = 0; i < lines.Length; i++)
            {
                string line = lines[i].Trim();
                if (line.Contains("1. רקע כללי") || line.StartsWith("## 1.") || line.StartsWith("**1."))
                {
                    // מצאנו את תחילת התוכן האמיתי
                    return string.Join("\n", lines.Skip(i));
                }
            }

            return content; // אם לא מצאנו כפילות, נחזיר את התוכן המקורי
        }

        private string CleanMarkdown(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            // הסרת סימני Markdown
            text = text.Replace("**", "").Replace("*", "");
            text = text.Replace("###", "").Replace("##", "").Replace("#", "");
            text = text.TrimStart(' ', '-', '•', '*');

            // הסרת סימני טבלה מיותרים
            text = text.Replace("|---|---|---|", "");
            text = text.Replace("---|---|---", "");

            // הסרת סימני צינור מיותרים מהתחלה והסוף
            text = text.Trim('|', ' ');

            return text.Trim();
        }

        private void AddFormattedParagraph(Body body, string text)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(CreateRTLParagraphProperties());

            // חיפוש אחר טקסט מודגש במקור
            if (text.Contains("**"))
            {
                // עיבוד מעורב של טקסט רגיל ומודגש
                AddMixedFormattingRun(paragraph, text);
            }
            else
            {
                // טקסט רגיל
                Run run = new Run();
                run.AppendChild(CreateRTLRunProperties(false, "22"));
                run.AppendChild(new WordText(text));
                paragraph.AppendChild(run);
            }

            body.AppendChild(paragraph);
        }

        private void AddMixedFormattingRun(Paragraph paragraph, string text)
        {
            // פיצול הטקסט לחלקים מודגשים ורגילים
            var parts = Regex.Split(text, @"\*\*(.*?)\*\*");

            for (int i = 0; i < parts.Length; i++)
            {
                if (string.IsNullOrEmpty(parts[i])) continue;

                Run run = new Run();
                bool isBold = (i % 2 == 1); // כל חלק אי-זוגי הוא מודגש
                run.AppendChild(CreateRTLRunProperties(isBold, "22"));
                run.AppendChild(new WordText(parts[i]));
                paragraph.AppendChild(run);
            }
        }

        private bool IsMainHeading(string line)
        {
            return line.StartsWith("# ") || line.StartsWith("## ") ||
                   Regex.IsMatch(line, @"^\*?\*?\d+\.\s") || // מספרים
                   line.Contains("רקע כללי") || line.Contains("סיכום כללי") ||
                   line.Contains("התקדמות לפי תחומי") || line.Contains("מטרות טיפוליות") ||
                   line.Contains("המלצות כלליות") || line.Contains("סיכום ומעקב");
        }

        private bool IsSubHeading(string line)
        {
            return line.StartsWith("### ") ||
                   line.Contains("פיזיותרפיה") || line.Contains("ריפוי בעיסוק") ||
                   line.Contains("תזונה") || line.Contains("רפואי") || line.Contains("רגשי");
        }

        private bool IsSubSubHeading(string line)
        {
            return line.StartsWith("#### ");
        }

        private bool IsBulletPoint(string line)
        {
            return line.StartsWith("• ") || line.StartsWith("- ") || line.StartsWith("* ") ||
                   line.StartsWith("1.") || line.StartsWith("2.") || line.StartsWith("3.") ||
                   line.StartsWith("4.") || line.StartsWith("5.");
        }

        private string CleanBulletText(string line)
        {
            if (line.StartsWith("• ")) return line.Substring(2);
            if (line.StartsWith("- ")) return line.Substring(2);
            if (line.StartsWith("* ")) return line.Substring(2);
            if (Regex.IsMatch(line, @"^\d+\.\s")) return Regex.Replace(line, @"^\d+\.\s", "");
            return line;
        }

        private void AddHeading(Body body, string text, int level)
        {
            Paragraph paragraph = new Paragraph();

            // הגדרת סגנון לפי רמה
            var props = CreateRTLParagraphProperties();

            string fontSize = level switch
            {
                1 => "28", // 14pt
                2 => "26", // 13pt
                3 => "24", // 12pt
                _ => "22"  // 11pt
            };

            string color = level switch
            {
                1 => "2F5496", // כחול כהה
                2 => "1F3864", // כחול כהה יותר
                _ => "000000"  // שחור
            };

            props.AppendChild(new SpacingBetweenLines()
            {
                Before = level == 1 ? "480" : "360",
                After = level == 1 ? "240" : "180"
            });

            paragraph.AppendChild(props);

            Run run = new Run();
            run.AppendChild(CreateRTLRunProperties(true, fontSize, color));
            run.AppendChild(new WordText(text));

            paragraph.AppendChild(run);
            body.AppendChild(paragraph);
        }

        private void AddParagraph(Body body, string text, bool isBold)
        {
            Paragraph paragraph = new Paragraph();
            var props = CreateRTLParagraphProperties();
            props.AppendChild(new SpacingBetweenLines() { After = "120" });
            paragraph.AppendChild(props);

            Run run = new Run();
            run.AppendChild(CreateRTLRunProperties(isBold, "22"));
            run.AppendChild(new WordText(text));

            paragraph.AppendChild(run);
            body.AppendChild(paragraph);
        }

        private void AddBulletPoint(Body body, string text)
        {
            Paragraph paragraph = new Paragraph();
            var props = CreateRTLParagraphProperties();
            props.AppendChild(new SpacingBetweenLines() { After = "60" });
            props.AppendChild(new Indentation() { Right = "720" }); // הזחה 
            paragraph.AppendChild(props);

            // סימן התבליט
            Run bulletRun = new Run();
            bulletRun.AppendChild(CreateRTLRunProperties(false, "22"));
            bulletRun.AppendChild(new WordText("• "));

            // הטקסט
            Run textRun = new Run();
            textRun.AppendChild(CreateRTLRunProperties(false, "22"));
            textRun.AppendChild(new WordText(text));

            paragraph.AppendChild(bulletRun);
            paragraph.AppendChild(textRun);
            body.AppendChild(paragraph);
        }

        private void AddEmptyParagraph(Body body)
        {
            Paragraph paragraph = new Paragraph();
            paragraph.AppendChild(CreateRTLParagraphProperties());
            paragraph.AppendChild(new Run(new WordText("")));
            body.AppendChild(paragraph);
        }

        private void AddHeaderAndFooter(MainDocumentPart mainPart, TasheReport report)
        {
            // הוספת כותרת עליונה
            HeaderPart headerPart = mainPart.AddNewPart<HeaderPart>();
            headerPart.Header = new Header();

            Paragraph headerParagraph = new Paragraph();
            var headerProps = CreateRTLParagraphProperties(JustificationValues.Center);
            headerParagraph.AppendChild(headerProps);

            Run headerRun = new Run();
            headerRun.AppendChild(CreateRTLRunProperties(false, "20", "7F7F7F"));
            headerRun.AppendChild(new WordText("גן הילד - חיפה | דוח תש\"ה"));

            headerParagraph.AppendChild(headerRun);
            headerPart.Header.AppendChild(headerParagraph);

            // הוספת כותרת תחתונה
            FooterPart footerPart = mainPart.AddNewPart<FooterPart>();
            footerPart.Footer = new Footer();

            Paragraph footerParagraph = new Paragraph();
            var footerProps = CreateRTLParagraphProperties(JustificationValues.Center);
            footerParagraph.AppendChild(footerProps);

            Run footerRun = new Run();
            footerRun.AppendChild(CreateRTLRunProperties(false, "18", "7F7F7F"));
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
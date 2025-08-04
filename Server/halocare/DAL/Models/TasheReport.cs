
using halocare.BL.Services;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Text;

namespace halocare.DAL.Models
{
    public class TasheReport
    {
        public int ReportId { get; set; }
        public int KidId { get; set; }
        public DateTime GeneratedDate { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public string ReportContent { get; set; }
        public int GeneratedByEmployeeId { get; set; }
        public bool IsApproved { get; set; }
        public int? ApprovedByEmployeeId { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string ReportTitle { get; set; }
        public string Notes { get; set; }
    }

    public class TreatmentForTashe
    {
        public int TreatmentId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime TreatmentDate { get; set; }
        public string Description { get; set; }
        public int? CooperationLevel { get; set; }
        public string Highlight { get; set; }
        public int? TreatmentTypeId { get; set; }
        public string TreatmentTypeName { get; set; }
        public string TreatmentColor { get; set; }
        public string EmployeeName { get; set; }
        public string RoleName { get; set; }
        public string KidName { get; set; }
    }
}

using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class TreatmentService
    {
        private readonly TreatmentRepository _treatmentRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly TreatmentTypeRepository _treatmentTypeRepository;

        public TreatmentService(IConfiguration configuration)
        {
            _treatmentRepository = new TreatmentRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
            _treatmentTypeRepository = new TreatmentTypeRepository(configuration);
        }

        public List<Treatment> GetAllTreatments()
        {
            return _treatmentRepository.GetAllTreatments();
        }

        public Treatment GetTreatmentById(int id)
        {
            return _treatmentRepository.GetTreatmentById(id);
        }

        public List<Treatment> GetTreatmentsByKidId(int kidId)
        {
            return _treatmentRepository.GetTreatmentsByKidId(kidId);
        }

        public int AddTreatment(Treatment treatment)
        {
            // וידוא שהילד קיים ופעיל
            Kid kid = _kidRepository.GetKidById(treatment.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן להוסיף טיפול לילד שאינו פעיל");
            }

            // וידוא שהמטפל קיים ופעיל
            Employee employee = _employeeRepository.GetEmployeeById(treatment.EmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("המטפל לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן להוסיף טיפול למטפל שאינו פעיל");
            }

            // וידוא שסוג הטיפול קיים
            TreatmentType treatmentType = _treatmentTypeRepository.GetTreatmentTypeByName(treatment.TreatmentType);
            if (treatmentType == null)
            {
                throw new ArgumentException("סוג הטיפול אינו קיים במערכת");
            }

            // וידוא שרמת שיתוף הפעולה היא בטווח תקין (1-5)
            if (treatment.CooperationLevel < 1 || treatment.CooperationLevel > 5)
            {
                throw new ArgumentException("רמת שיתוף הפעולה חייבת להיות בטווח 1-5");
            }

            // הגדרת תאריך הטיפול אם לא צוין
            if (treatment.TreatmentDate == DateTime.MinValue)
            {
                treatment.TreatmentDate = DateTime.Now;
            }

            return _treatmentRepository.AddTreatment(treatment);
        }

        public bool UpdateTreatment(Treatment treatment)
        {
            // וידוא שהטיפול קיים
            Treatment existingTreatment = _treatmentRepository.GetTreatmentById(treatment.TreatmentId);
            if (existingTreatment == null)
            {
                throw new ArgumentException("הטיפול לא נמצא במערכת");
            }

            // וידוא שרמת שיתוף הפעולה היא בטווח תקין (1-5)
            if (treatment.CooperationLevel < 1 || treatment.CooperationLevel > 5)
            {
                throw new ArgumentException("רמת שיתוף הפעולה חייבת להיות בטווח 1-5");
            }

            return _treatmentRepository.UpdateTreatment(treatment);
        }

        public bool DeleteTreatment(int id)
        {
            // וידוא שהטיפול קיים
            Treatment existingTreatment = _treatmentRepository.GetTreatmentById(id);
            if (existingTreatment == null)
            {
                throw new ArgumentException("הטיפול לא נמצא במערכת");
            }

            return _treatmentRepository.DeleteTreatment(id);
        }
    }
}
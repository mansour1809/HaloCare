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
        
        public List<Treatment> GetTreatmentsByKidIdAndTreatmentId(int kidId, int treatmentTypeId)
        {
            return _treatmentRepository.GetTreatmentsByKidIdAndTreatmentId(kidId, treatmentTypeId);
        }

        public List<Treatment> GetTreatmentsByKidIdAndTypeAndDateRange(int kidId, int treatmentId, DateTime startDate, DateTime endDate)
        {
            return _treatmentRepository.GetTreatmentsByKidIdAndTypeAndDateRange(kidId, treatmentId, startDate,endDate );

        }

        public int AddTreatment(Treatment treatment)
        {
            // check if kid exist and active
            Kid kid = _kidRepository.GetKidById(treatment.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן להוסיף טיפול לילד שאינו פעיל");
            }

            // check if employee exist and active
            Employee employee = _employeeRepository.GetEmployeeById(treatment.EmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("המטפל לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן להוסיף טיפול למטפל שאינו פעיל");
            }

            // check if type exist
            TreatmentType treatmentType = _treatmentTypeRepository.GetTreatmentTypeById(treatment.TreatmentTypeId);
            if (treatmentType == null)
            {
                throw new ArgumentException("סוג הטיפול אינו קיים במערכת");
            }


            return _treatmentRepository.AddTreatment(treatment);
        }

        public bool UpdateTreatment(Treatment treatment)
        {
            // check if 
            Treatment existingTreatment = _treatmentRepository.GetTreatmentById(treatment.TreatmentId);
            if (existingTreatment == null)
            {
                throw new ArgumentException("הטיפול לא נמצא במערכת");
            }


            return _treatmentRepository.UpdateTreatment(treatment);
        }

        public bool DeleteTreatment(int id)
        {
            // check if type exist
            Treatment existingTreatment = _treatmentRepository.GetTreatmentById(id);
            if (existingTreatment == null)
            {
                throw new ArgumentException("הטיפול לא נמצא במערכת");
            }

            return _treatmentRepository.DeleteTreatment(id);
        }
    }
}
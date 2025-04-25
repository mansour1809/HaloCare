using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class TreatmentTypeService
    {
        private readonly TreatmentTypeRepository _treatmentTypeRepository;

        public TreatmentTypeService(IConfiguration configuration)
        {
            _treatmentTypeRepository = new TreatmentTypeRepository(configuration);
        }

        public List<TreatmentType> GetAllTreatmentTypes()
        {
            return _treatmentTypeRepository.GetAllTreatmentTypes();
        }

        public TreatmentType GetTreatmentTypeById(int typeId)
        {
            //if (string.IsNullOrEmpty(typeId))
            //{
            //    throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            //}

            return _treatmentTypeRepository.GetTreatmentTypeById(typeId);
        }

        public bool AddTreatmentType(TreatmentType treatmentType)
        {
            // וידוא שיש שם לסוג הטיפול
            if (string.IsNullOrEmpty(treatmentType.TreatmentTypeName))
            {
                throw new ArgumentException("שם סוג הטיפול הוא שדה חובה");
            }

            // בדיקה אם סוג הטיפול כבר קיים
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentType.TreatmentTypeId);
            if (existingType != null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentType.TreatmentTypeName}' כבר קיים במערכת");
            }

            return _treatmentTypeRepository.AddTreatmentType(treatmentType);
        }

        public bool UpdateTreatmentType(int treatmentTypeId, string newTreatmentTypeName)
        {
            // וידוא שיש שמות סוג טיפול
            if ( string.IsNullOrEmpty(newTreatmentTypeName))
            {
                throw new ArgumentException("שמות סוגי הטיפול לא יכולים להיות ריקים");
            }

            // בדיקה אם סוג הטיפול הישן קיים
            TreatmentType existingOldType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
            if (existingOldType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentTypeId}' לא נמצא במערכת");
            }

            // בדיקה אם סוג הטיפול החדש כבר קיים (אם זה לא אותו שם)

                TreatmentType existingNewType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
                if (existingNewType != null)
                {
                    throw new ArgumentException($"סוג הטיפול '{newTreatmentTypeName}' כבר קיים במערכת");
                }

            return _treatmentTypeRepository.UpdateTreatmentType(treatmentTypeId, newTreatmentTypeName);
        }

        public bool DeleteTreatmentType(int treatmentTypeId)
        {
            // וידוא שיש שם סוג טיפול
            if (treatmentTypeId == null)
            {
                throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            }

            // בדיקה אם סוג הטיפול קיים
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
            if (existingType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentTypeId}' לא נמצא במערכת");
            }

            // כאן אפשר להוסיף בדיקה אם יש טיפולים מסוג זה, ואם כן - למנוע מחיקה
            // (צריך להוסיף שירות שיבדוק אם קיימים טיפולים מסוג זה)

            return _treatmentTypeRepository.DeleteTreatmentType(treatmentTypeId);
        }
    }
}
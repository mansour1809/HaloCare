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

        public TreatmentType GetTreatmentTypeByName(string treatmentTypeName)
        {
            if (string.IsNullOrEmpty(treatmentTypeName))
            {
                throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            }

            return _treatmentTypeRepository.GetTreatmentTypeByName(treatmentTypeName);
        }

        public bool AddTreatmentType(TreatmentType treatmentType)
        {
            // וידוא שיש שם לסוג הטיפול
            if (string.IsNullOrEmpty(treatmentType.TreatmentTypeName))
            {
                throw new ArgumentException("שם סוג הטיפול הוא שדה חובה");
            }

            // בדיקה אם סוג הטיפול כבר קיים
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeByName(treatmentType.TreatmentTypeName);
            if (existingType != null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentType.TreatmentTypeName}' כבר קיים במערכת");
            }

            return _treatmentTypeRepository.AddTreatmentType(treatmentType);
        }

        public bool UpdateTreatmentType(string oldTreatmentTypeName, string newTreatmentTypeName)
        {
            // וידוא שיש שמות סוג טיפול
            if (string.IsNullOrEmpty(oldTreatmentTypeName) || string.IsNullOrEmpty(newTreatmentTypeName))
            {
                throw new ArgumentException("שמות סוגי הטיפול לא יכולים להיות ריקים");
            }

            // בדיקה אם סוג הטיפול הישן קיים
            TreatmentType existingOldType = _treatmentTypeRepository.GetTreatmentTypeByName(oldTreatmentTypeName);
            if (existingOldType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{oldTreatmentTypeName}' לא נמצא במערכת");
            }

            // בדיקה אם סוג הטיפול החדש כבר קיים (אם זה לא אותו שם)
            if (oldTreatmentTypeName != newTreatmentTypeName)
            {
                TreatmentType existingNewType = _treatmentTypeRepository.GetTreatmentTypeByName(newTreatmentTypeName);
                if (existingNewType != null)
                {
                    throw new ArgumentException($"סוג הטיפול '{newTreatmentTypeName}' כבר קיים במערכת");
                }
            }

            return _treatmentTypeRepository.UpdateTreatmentType(oldTreatmentTypeName, newTreatmentTypeName);
        }

        public bool DeleteTreatmentType(string treatmentTypeName)
        {
            // וידוא שיש שם סוג טיפול
            if (string.IsNullOrEmpty(treatmentTypeName))
            {
                throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            }

            // בדיקה אם סוג הטיפול קיים
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeByName(treatmentTypeName);
            if (existingType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentTypeName}' לא נמצא במערכת");
            }

            // כאן אפשר להוסיף בדיקה אם יש טיפולים מסוג זה, ואם כן - למנוע מחיקה
            // (צריך להוסיף שירות שיבדוק אם קיימים טיפולים מסוג זה)

            return _treatmentTypeRepository.DeleteTreatmentType(treatmentTypeName);
        }
    }
}
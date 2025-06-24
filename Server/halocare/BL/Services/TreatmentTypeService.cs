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
            // Validation: typeId cannot be empty or invalid
            // if (string.IsNullOrEmpty(typeId))
            // {
            //     throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            // }

            return _treatmentTypeRepository.GetTreatmentTypeById(typeId);
        }

        public bool AddTreatmentType(TreatmentType treatmentType)
        {
            // Ensure the treatment type name is provided
            if (string.IsNullOrEmpty(treatmentType.TreatmentTypeName))
            {
                throw new ArgumentException("שם סוג הטיפול הוא שדה חובה");
            }

            // Check if the treatment type already exists
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentType.TreatmentTypeId);
            if (existingType != null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentType.TreatmentTypeName}' כבר קיים במערכת");
            }

            return _treatmentTypeRepository.AddTreatmentType(treatmentType);
        }

        public bool UpdateTreatmentType(int treatmentTypeId, string newTreatmentTypeName)
        {
            // Ensure new treatment type name is provided
            if (string.IsNullOrEmpty(newTreatmentTypeName))
            {
                throw new ArgumentException("שמות סוגי הטיפול לא יכולים להיות ריקים");
            }

            // Check if the old treatment type exists
            TreatmentType existingOldType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
            if (existingOldType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentTypeId}' לא נמצא במערכת");
            }

            // Check if the new treatment type already exists (if it's a different name)
            TreatmentType existingNewType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
            if (existingNewType != null)
            {
                throw new ArgumentException($"סוג הטיפול '{newTreatmentTypeName}' כבר קיים במערכת");
            }

            return _treatmentTypeRepository.UpdateTreatmentType(treatmentTypeId, newTreatmentTypeName);
        }

        public bool DeleteTreatmentType(int treatmentTypeId)
        {
            // Validate that treatment type ID is valid
            // Note: int is a value type, can't be null, so this check might be redundant
            if (treatmentTypeId == null)
            {
                throw new ArgumentException("שם סוג הטיפול לא יכול להיות ריק");
            }

            // Check if treatment type exists
            TreatmentType existingType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
            if (existingType == null)
            {
                throw new ArgumentException($"סוג הטיפול '{treatmentTypeId}' לא נמצא במערכת");
            }

            // Here you can add a check if there are treatments of this type, and if so - prevent deletion
            // (You would need a service method that verifies if treatments exist for this type)

            return _treatmentTypeRepository.DeleteTreatmentType(treatmentTypeId);
        }
    }
}

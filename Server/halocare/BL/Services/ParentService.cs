using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class ParentService
    {
        private readonly ParentRepository _parentRepository;
        private readonly KidRepository _kidRepository;
        private readonly CityRepository _cityRepository;

        public ParentService(IConfiguration configuration)
        {
            _parentRepository = new ParentRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _cityRepository = new CityRepository(configuration);
        }

        public List<Parent> GetAllParents()
        {
            return _parentRepository.GetAllParents();
        }

        public Parent GetParentById(int id)
        {
            return _parentRepository.GetParentById(id);
        }

        public int AddParent(Parent parent)
        {
            // וידוא שיש לפחות מספר טלפון אחד
            if (string.IsNullOrEmpty(parent.MobilePhone) && string.IsNullOrEmpty(parent.HomePhone))
            {
                throw new ArgumentException("חובה למלא לפחות מספר טלפון אחד (נייד או בבית)");
            }

            // וידוא שהעיר קיימת, אם צוינה
            if (!string.IsNullOrEmpty(parent.CityName))
            {
                City city = _cityRepository.GetCityByName(parent.CityName);
                if (city == null)
                {
                    throw new ArgumentException("העיר שצוינה אינה קיימת במערכת");
                }
            }

            return _parentRepository.AddParent(parent);
        }

        public bool UpdateParent(Parent parent)
        {
            // וידוא שההורה קיים
            Parent existingParent = _parentRepository.GetParentById(parent.ParentId);
            if (existingParent == null)
            {
                throw new ArgumentException("ההורה לא נמצא במערכת");
            }

            // וידוא שיש לפחות מספר טלפון אחד
            if (string.IsNullOrEmpty(parent.MobilePhone) && string.IsNullOrEmpty(parent.HomePhone))
            {
                throw new ArgumentException("חובה למלא לפחות מספר טלפון אחד (נייד או בבית)");
            }

            // וידוא שהעיר קיימת, אם צוינה
            if (!string.IsNullOrEmpty(parent.CityName))
            {
                City city = _cityRepository.GetCityByName(parent.CityName);
                if (city == null)
                {
                    throw new ArgumentException("העיר שצוינה אינה קיימת במערכת");
                }
            }

            return _parentRepository.UpdateParent(parent);
        }

        public List<Kid> GetParentKids(int parentId)
        {
            // קבלת כל הילדים
            List<Kid> allKids = _kidRepository.GetAllKids();

            // סינון הילדים ששייכים להורה הספציפי
            return allKids.FindAll(kid => kid.ParentId1 == parentId || kid.ParentId2 == parentId);
        }
    }
}
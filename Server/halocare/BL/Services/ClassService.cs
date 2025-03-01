﻿using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class ClassService
    {
        private readonly ClassRepository _classRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly KidRepository _kidRepository;

        public ClassService(IConfiguration configuration)
        {
            _classRepository = new ClassRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
            _kidRepository = new KidRepository(configuration);
        }

        public List<Class> GetAllClasses()
        {
            return _classRepository.GetAllClasses();
        }

        public Class GetClassById(int id)
        {
            return _classRepository.GetClassById(id);
        }

        public int AddClass(Class classItem)
        {
            // וידוא שהמחנכת קיימת ופעילה
            Employee teacher = _employeeRepository.GetEmployeeById(classItem.TeacherId);
            if (teacher == null)
            {
                throw new ArgumentException("המחנכת לא נמצאה במערכת");
            }
            if (!teacher.IsActive)
            {
                throw new ArgumentException("לא ניתן לשייך כיתה למחנכת שאינה פעילה");
            }

            return _classRepository.AddClass(classItem);
        }

        public bool UpdateClass(Class classItem)
        {
            // וידוא שהכיתה קיימת
            Class existingClass = _classRepository.GetClassById(classItem.ClassId);
            if (existingClass == null)
            {
                throw new ArgumentException("הכיתה לא נמצאה במערכת");
            }

            // וידוא שהמחנכת קיימת ופעילה
            Employee teacher = _employeeRepository.GetEmployeeById(classItem.TeacherId);
            if (teacher == null)
            {
                throw new ArgumentException("המחנכת לא נמצאה במערכת");
            }
            if (!teacher.IsActive)
            {
                throw new ArgumentException("לא ניתן לשייך כיתה למחנכת שאינה פעילה");
            }

            return _classRepository.UpdateClass(classItem);
        }

        public List<Kid> GetKidsInClass(int classId)
        {
            // קבלת כל הילדים
            List<Kid> allKids = _kidRepository.GetAllKids();

            // סינון הילדים ששייכים לכיתה הספציפית
            return allKids.FindAll(kid => kid.ClassId == classId);
        }

        public bool DeleteClass(int id)
        {
            // וידוא שהכיתה קיימת
            Class existingClass = _classRepository.GetClassById(id);
            if (existingClass == null)
            {
                throw new ArgumentException("הכיתה לא נמצאה במערכת");
            }

            // בדיקה אם יש ילדים בכיתה
            List<Kid> kidsInClass = GetKidsInClass(id);
            if (kidsInClass.Count > 0)
            {
                throw new ArgumentException("לא ניתן למחוק כיתה שיש בה ילדים");
            }

            return _classRepository.DeleteClass(id);
        }
    }
}
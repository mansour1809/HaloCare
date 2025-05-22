using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class KidService
    {
        private readonly KidRepository _kidRepository;
        private readonly TreatmentRepository _treatmentRepository;
        private readonly AlertRepository _alertRepository;
        private readonly AttendanceRepository _attendanceRepository;
        //private readonly TSHARepository _tshaRepository;

        public KidService(IConfiguration configuration)
        {
            _kidRepository = new KidRepository(configuration);
            _treatmentRepository = new TreatmentRepository(configuration);
            _alertRepository = new AlertRepository(configuration);
            _attendanceRepository = new AttendanceRepository(configuration);
            //_tshaRepository = new TSHARepository(configuration);
        }

        public List<Kid> GetAllKids()
        {
            return _kidRepository.GetAllKids();
        }

        public Kid GetKidById(int id)
        {
            return _kidRepository.GetKidById(id);
        }

        public int AddKid(Kid kid)
        {
            // check if the kid age is between 0-3 years
            DateTime minBirthDate = DateTime.Today.AddYears(-3);
            if (kid.BirthDate < minBirthDate)
            {
                throw new ArgumentException("kid age have to be between 0-3 years");
            }


            // save kid details
            return _kidRepository.AddKid(kid);
        }

        public bool UpdateKid(Kid kid)
        {
            // check if the kid exist
            Kid existingKid = _kidRepository.GetKidById(kid.Id);
            if (existingKid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // update kid details
            return _kidRepository.UpdateKid(kid);
        }

        public bool DeactivateKid(int id)
        {
            // check if the kid exist
            Kid existingKid = _kidRepository.GetKidById(id);
            if (existingKid == null)
            {
                throw new ArgumentException("the kid is not exist");
            }

            // deactivate kid
            return _kidRepository.DeactivateKid(id);
        }

        public List<Treatment> GetKidTreatments(int kidId)
        {
            return _treatmentRepository.GetTreatmentsByKidId(kidId);
        }

        public List<Alert> GetKidAlerts(int kidId)
        {
            return _alertRepository.GetAlertsByKidId(kidId);
        }

        public List<Attendance> GetKidAttendance(int kidId)
        {
            return _attendanceRepository.GetAttendancesByKidId(kidId);
        }

        //public List<TSHA> GetKidTSHAs(int kidId)
        //{
        //    return _tshaRepository.GetTSHAsByKidId(kidId);
        //}

        public Kid GetKidFile(int kidId)
        {
            // get kid with all details
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("the kid does not found");
            }

            return kid;
        }
    }
}
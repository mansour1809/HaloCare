﻿using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class HomeVisitService
    {
        private readonly HomeVisitRepository _homeVisitRepository;
        private readonly KidRepository _kidRepository;

        public HomeVisitService(IConfiguration configuration)
        {
            _homeVisitRepository = new HomeVisitRepository(configuration);
            _kidRepository = new KidRepository(configuration);
        }

        public List<HomeVisit> GetAllHomeVisits()
        {
            return _homeVisitRepository.GetAllHomeVisits();
        }

        public HomeVisit GetHomeVisitById(int id)
        {
            return _homeVisitRepository.GetHomeVisitById(id);
        }

        public List<HomeVisit> GetHomeVisitsByKidId(int kidId)
        {
            return _homeVisitRepository.GetHomeVisitsByKidId(kidId);
        }

        public int AddHomeVisit(HomeVisit homeVisit)
        {
            // Verify that the kid exists and is active
            Kid kid = _kidRepository.GetKidById(homeVisit.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן לתעד ביקור בית לילד שאינו פעיל");
            }

            // Set the visit date if not specified
            if (homeVisit.VisitDate == DateTime.MinValue)
            {
                homeVisit.VisitDate = DateTime.Now;
            }

            return _homeVisitRepository.AddHomeVisit(homeVisit);
        }

        public bool UpdateHomeVisit(HomeVisit homeVisit)
        {
            // Verify that the visit exists
            HomeVisit existingVisit = _homeVisitRepository.GetHomeVisitById(homeVisit.VisitId);
            if (existingVisit == null)
            {
                throw new ArgumentException("ביקור הבית לא נמצא במערכת");
            }

            return _homeVisitRepository.UpdateHomeVisit(homeVisit);
        }

        public bool DeleteHomeVisit(int id)
        {
            // Verify that the visit exists
            HomeVisit existingVisit = _homeVisitRepository.GetHomeVisitById(id);
            if (existingVisit == null)
            {
                throw new ArgumentException("ביקור הבית לא נמצא במערכת");
            }

            return _homeVisitRepository.DeleteHomeVisit(id);
        }

        public List<HomeVisit> GetUpcomingHomeVisits(int daysAhead = 7)
        {
            // Get all home visits
            List<HomeVisit> allVisits = _homeVisitRepository.GetAllHomeVisits();

            // Filter visits scheduled for the next X days
            DateTime today = DateTime.Today;
            DateTime maxDate = today.AddDays(daysAhead);

            return allVisits.FindAll(visit => visit.VisitDate >= today && visit.VisitDate <= maxDate);
        }
    }
}

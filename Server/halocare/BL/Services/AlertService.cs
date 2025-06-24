using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class AlertService
    {
        private readonly AlertRepository _alertRepository;
        private readonly KidRepository _kidRepository;

        public AlertService(IConfiguration configuration)
        {
            _alertRepository = new AlertRepository(configuration);
            _kidRepository = new KidRepository(configuration);
        }

        public List<Alert> GetAllAlerts()
        {
            return _alertRepository.GetAllAlerts();
        }

        public Alert GetAlertById(int id)
        {
            return _alertRepository.GetAlertById(id);
        }

        public List<Alert> GetAlertsByKidId(int kidId)
        {
            return _alertRepository.GetAlertsByKidId(kidId);
        }

        public int AddAlert(Alert alert)
        {
            // Ensure the child exists and is active
            Kid kid = _kidRepository.GetKidById(alert.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן להוסיף התראה לילד שאינו פעיל");
            }

            // Ensure the status is valid
            if (alert.Status != "פעיל" && alert.Status != "טופל" && alert.Status != "בוטל")
            {
                throw new ArgumentException("סטטוס ההתראה אינו תקין");
            }

            // Set the creation date for the alert
            alert.CreatedDate = DateTime.Now;

            return _alertRepository.AddAlert(alert);
        }

        public bool UpdateAlert(Alert alert)
        {
            // Ensure the alert exists
            Alert existingAlert = _alertRepository.GetAlertById(alert.AlertId);
            if (existingAlert == null)
            {
                throw new ArgumentException("ההתראה לא נמצאה במערכת");
            }

            // Ensure the status is valid
            if (alert.Status != "פעיל" && alert.Status != "טופל" && alert.Status != "בוטל")
            {
                throw new ArgumentException("סטטוס ההתראה אינו תקין");
            }

            return _alertRepository.UpdateAlert(alert);
        }

        public bool DeleteAlert(int id)
        {
            // Ensure the alert exists
            Alert existingAlert = _alertRepository.GetAlertById(id);
            if (existingAlert == null)
            {
                throw new ArgumentException("ההתראה לא נמצאה במערכת");
            }

            return _alertRepository.DeleteAlert(id);
        }

        public List<Alert> GetActiveAlerts()
        {
            // Retrieve all alerts
            List<Alert> allAlerts = _alertRepository.GetAllAlerts();

            // Filter active alerts
            return allAlerts.FindAll(alert => alert.Status == "פעיל");
        }

        public List<Alert> GetOverdueAlerts()
        {
            // Retrieve all alerts
            List<Alert> allAlerts = _alertRepository.GetAllAlerts();

            // Filter active alerts that are overdue
            return allAlerts.FindAll(alert => alert.Status == "פעיל" && alert.DueDate < DateTime.Today);
        }
    }
}

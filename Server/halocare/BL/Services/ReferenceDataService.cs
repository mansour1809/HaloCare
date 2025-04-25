using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class ReferenceDataService
    {
        private readonly CityRepository _cityRepository;
        private readonly HealthInsuranceRepository _healthInsuranceRepository;
        private readonly TreatmentTypeRepository _treatmentTypeRepository;
        private readonly RoleRepository _roleRepository;

        public ReferenceDataService(IConfiguration configuration)
        {
            _cityRepository = new CityRepository(configuration);
            _healthInsuranceRepository = new HealthInsuranceRepository(configuration);
            _treatmentTypeRepository = new TreatmentTypeRepository(configuration);
            _roleRepository = new RoleRepository(configuration);
        }

        // Cities
        public List<City> GetAllCities()
        {
            return _cityRepository.GetAllCities();
        }

        public City GetCityByName(string cityName)
        {
            return _cityRepository.GetCityByName(cityName);
        }

        public bool AddCity(City city)
        {
            return _cityRepository.AddCity(city);
        }

        // Health Insurances
        public List<HealthInsurance> GetAllHealthInsurances()
        {
            return _healthInsuranceRepository.GetAllHealthInsurances();
        }

        public HealthInsurance GetHealthInsuranceByName(string hName)
        {
            return _healthInsuranceRepository.GetHealthInsuranceByName(hName);
        }

        public bool AddHealthInsurance(HealthInsurance healthInsurance)
        {
            return _healthInsuranceRepository.AddHealthInsurance(healthInsurance);
        }

        // Treatment Types
        public List<TreatmentType> GetAllTreatmentTypes()
        {
            return _treatmentTypeRepository.GetAllTreatmentTypes();
        }

        public TreatmentType GetTreatmentTypeById(int typeId)
        {
            return _treatmentTypeRepository.GetTreatmentTypeById(typeId);
        }

        public bool AddTreatmentType(TreatmentType treatmentType)
        {
            return _treatmentTypeRepository.AddTreatmentType(treatmentType);
        }

        // Roles
        public List<Role> GetAllRoles()
        {
            return _roleRepository.GetAllRoles();
        }

        public Role GetRoleByName(string roleName)
        {
            return _roleRepository.GetRoleByName(roleName);
        }

        public bool AddRole(Role role)
        {
            return _roleRepository.AddRole(role);
        }
    }
}
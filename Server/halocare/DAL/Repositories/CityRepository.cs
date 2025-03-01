using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class CityRepository : DBService
    {
        public CityRepository(IConfiguration configuration) : base(configuration) { }

        public List<City> GetAllCities()
        {
            List<City> cities = new List<City>();
            DataTable dataTable = ExecuteQuery("GetAllCities");

            foreach (DataRow row in dataTable.Rows)
            {
                City city = new City
                {
                    CityName = row["CityName"].ToString()
                };

                cities.Add(city);
            }

            return cities;
        }

        public City GetCityByName(string cityName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@CityName", cityName }
            };

            DataTable dataTable = ExecuteQuery("GetCityByName", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            City city = new City
            {
                CityName = row["CityName"].ToString()
            };

            return city;
        }

        public bool AddCity(City city)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@CityName", city.CityName }
            };

            int rowsAffected = ExecuteNonQuery("AddCity", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateCity(string oldCityName, string newCityName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@OldCityName", oldCityName },
                { "@NewCityName", newCityName }
            };

            int rowsAffected = ExecuteNonQuery("UpdateCity", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteCity(string cityName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@CityName", cityName }
            };

            int rowsAffected = ExecuteNonQuery("DeleteCity", parameters);
            return rowsAffected > 0;
        }
    }
}
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import PublicIcon from '@material-ui/icons/Public';
import React, { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import './App.css';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");

  // STATE = How to write a variable in React

  // useEffect = Runs a piece of code based on a given condition

  // https://disease.sh/v3/covid-19/countries

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all").then(response => response.json()).then(data => {
      setCountryInfo(data);
    })
  }, [] )

  useEffect(() => {
    // The code inside here, only once when the component loads, and not
    // async -> send a request, wait for it, do something with info

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries =  data.map((country) => (
          {
            name: country.country, // India, United Kingdom, United States, France
            value: country.countryInfo.iso2, // IN, USA, UK, FR
          }
        ));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);

      });
    }

    getCountriesData();
  }, [] );

  const onCountryChange = async(event) => {
    const countryCode = event.target.value;

    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then(response => response.json()).then(data => {
      setCountry(countryCode)
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  }

  console.log('COUNTRY INFO >>> ', countryInfo)

  return (
    <div className="app">

      <div className="app__left">
      <div className="app__header">
          {/* Header */}
          {/* Title + Select country dropdown */}
          <h1>COVID-19 Tracker</h1>
            <FormControl className="app__dropdown">
              <Select 
                variant="outlined"
                value={country}
                onChange={onCountryChange}
                >
                  {/* Loop through all the countries and show a drop down list of the options */}

                  <MenuItem value="worldwide"><PublicIcon /> Worldwide</MenuItem>

                  {
                    countries.map(country => (
                      <MenuItem value={country.value}><img src={countryInfo.countryInfo?.flag} className="country__flag" /> {country.name}</MenuItem>
                    ))
                  }

                  {/* <MenuItem value="worldwide">Worldwide</MenuItem>
                  <MenuItem value="worldwide">India</MenuItem>
                  <MenuItem value="worldwide">Los Angeles</MenuItem>
                  <MenuItem value="worldwide">London</MenuItem>
                  <MenuItem value="worldwide">New York</MenuItem> */}
              </Select>
            </FormControl>
        </div>

        <div className="app__stats">
          {/* InfoBoxes title = "CoronaVirus cases" */}
          <InfoBox isRed active={casesType === "cases"} onClick={e => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />

          {/* InfoBoxes title = "CoronaVirus recoveries" */}
          <InfoBox active={casesType === "recovered"} onClick={e => setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          
          {/* InfoBoxes title = "CoronaVirus deaths" */}
          <InfoBox isRed active={casesType === "deaths"} onClick={e => setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        {/* Map */}
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />

      </div>

      <Card className="app__right">
        
        <CardContent className="">
          {/* Table */}
          <h3 className="app__listTitle">Live Cases by Country</h3>
          <Table countries={tableData} />

          {/* Graph */}
            <h3 className="app__graphTitle">Worldwide New {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>

      </Card>

    </div>
  );
}

export default App;

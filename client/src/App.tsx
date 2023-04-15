import { useState } from 'react';
import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { DateTime } from 'luxon';
import { useMutation } from 'react-query';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';

const EUROPE_CITIES = [
  { name: 'Paris', value: 'Paris' },
  { name: 'Amsterdam', value: 'Amsterdam' },
  { name: 'Berlin', value: 'Berlin' },
  { name: 'Rome', value: 'Rome' },
  { name: 'Milan', value: 'Milan' },
];

const formatDateFromIso = (date: Date) => {
  const dateTime = DateTime.fromISO(date);
  return dateTime.toFormat('dd-MM-yyyy');
};

const formatDateFromJSDate = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  return dateTime.toFormat('yyyy-MM-dd');
};

function App() {
  const [dates, setDates] = useState([new Date(), new Date()]);
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [flights, setFlights] = useState<any>([]);

  const objectoToQueryParams = (obj: any) => {
    const params = new URLSearchParams();
    Object.keys(obj).forEach((key) => {
      params.append(key, obj[key]);
    });
    return params;
  };

  const getFlights = async (parameters: any) => {
    const queryParams = objectoToQueryParams(parameters);
    const response = await fetch(
      `http://localhost:8000/flights?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    return data;
  };

  const mutation = useMutation(getFlights, {
    onSuccess: (response: any) => {
      console.log(response);
      setFlights(response);
    },
  });

  const onSearch = () => {
    const { from, to } = formatDates(dates);
    const parameters = {
      departureCities: JSON.stringify(departure),
      destination: destination,
      from: from,
      to: to,
    };
    console.log(parameters);
    mutation.mutate(parameters);
  };

  const formatDates = (dates: Date[]) => {
    const from = formatDateFromJSDate(dates[0]);
    const to = formatDateFromJSDate(dates[1]);
    return { from, to };
  };

  const onDateRangeChange = (e: any) => {
    setDates(e.value);
  };

  const onDestinationChange = (e: any) => {
    setDestination(e.target.value);
  };

  const onDepartureChange = (e: any) => {
    setDeparture(e.value);
  };

  return (
    <div className="surface-ground w-full h-full min-h-screen p-2 gap-2 flex flex-column">
      <div
        className="p-card w-full flex justify-content-between p-2 gap-2 sticky"
        style={{
          top: 0,
        }}
      >
        <div className="flex justify-content-start gap-2">
          <MultiSelect
            value={departure}
            onChange={onDepartureChange}
            options={EUROPE_CITIES}
            optionLabel="name"
            placeholder="Départ"
            className="w-full md:w-20rem"
          />
          <InputText
            id={'destination'}
            placeholder={'Destination'}
            value={destination}
            onChange={onDestinationChange}
          />
          <Calendar
            value={dates}
            onChange={onDateRangeChange}
            selectionMode="range"
            readOnlyInput
          />
        </div>
        <Button label="Rechercher" onClick={onSearch} />
      </div>
      <div>
        {mutation.isLoading ? (
          <ProgressSpinner />
        ) : (
          <>
            {mutation.isError ? (
              <div>ERREUR: {mutation.error.message}</div>
            ) : null}

            {mutation.isSuccess ? (
              <div className="grid">
                {flights.map((flight: any, index: number) => {
                  return (
                    <div className="col" key={index}>
                      <div className="p-card p-2 gap-2 w-full">
                        <div className="text-blue-400 text-2xl mb-2">
                          <strong>{flight.price} €</strong>
                        </div>
                        <div className="flex justify-content-between">
                          <Leg leg={flight.wayIn} title={'Départ'}></Leg>
                          <Leg leg={flight.wayOut} title={'Retour'}></Leg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

const Leg = ({ leg, title }: any) => {
  return (
    <div className="flex flex-column gap-1 p-2">
      <strong className="text-lg">{title}</strong>
      <div className="mt-2 w-15rem">
        <div>
          De : <span className="text-blue-400">{leg.origin}</span>
        </div>
        <div>{formatDateFromIso(leg.departure)}</div>
        <div>
          Vers : <span className="text-blue-400">{leg.destination}</span>
        </div>
        <div>{formatDateFromIso(leg.arrival)}</div>
        <div>
          Temps de vol : <span className="text-blue-400">{leg.duration}</span>
        </div>
        <div className="mt-2">
          <strong>STOPS</strong>
        </div>
        <ul>
          {leg.stops.map((stop: any, index: number) => {
            return <li key={index}>{stop.name}</li>;
          })}
        </ul>
      </div>
    </div>
  );
};

import { useState } from 'react';
import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';

const EUROPE_CITIES = [
  { name: 'Paris', value: 'Paris' },
  { name: 'Amsterdam', value: 'Amsterdam' },
  { name: 'Berlin', value: 'Berlin' },
  { name: 'Rome', value: 'Rome' },
  { name: 'Milan', value: 'Milan' },
];

function App() {
  const [dates, setDates] = useState([new Date(), new Date()]);
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');

  const onSearch = () => {
    const { from, to } = formatDates(dates);
    const parameters = {
      departureCities: departure,
      destination: destination,
      from: from,
      to: to,
    };

    console.log(parameters);
  };

  const formatDates = (dates: Date[]) => {
    //format dates to this format : 2023-08-08
    const from = dates[0].toISOString().split('T')[0];
    const to = dates[1].toISOString().split('T')[0];
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
    <div className="bg-red-500 w-full h-full min-h-screen p-2 relative">
      <div className="p-card w-full flex justify-content-between p-2 gap-2 sticky">
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
    </div>
  );
}

export default App;

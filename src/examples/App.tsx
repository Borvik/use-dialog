import React, { useEffect } from 'react';
import { useDialog } from '../lib';
import { EditDialog } from './test';

import './App.css';

const addBodyClass = (className: string) => document.body.classList.add(className);
const removeBodyClass = (className: string) => document.body.classList.remove(className);

function App() {
  const [theme, setTheme] = React.useState('dark');
  const { dialog, showDialog } = useDialog(<EditDialog data={{
    first_name: '',
    last_name: '',
  }} />);

  useEffect(() => {
    addBodyClass(theme);
    return () => removeBodyClass(theme);
  }, [theme]);

  return (
    <div className={`App`}>
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
      </header>
      <div>
        {dialog}
        <button type='button' onClick={async() => {
          // Could do a "setState" here so <EditDialog data> actually has data.
          let result = await showDialog();
          // Result should be `undefined` if dialog was canceled
          console.log('Result:', result);
        }}>Show Dialog</button>
      </div>
    </div>
  );
}

export default App;
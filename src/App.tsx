import { useState } from 'react';
import { NurseDashboard } from './components/NurseDashboard';
import { InventoryDashboard } from './components/InventoryDashboard';
import { AdminRoster } from './components/AdminRoster';
import './App.css';

function App() {
  const [view, setView] = useState<'nurse' | 'admin'>('nurse');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
      <header style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🏥 IPS ERP</h1>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setView('nurse')}
            style={{
              marginRight: '10px',
              fontWeight: view === 'nurse' ? 'bold' : 'normal',
              textDecoration: view === 'nurse' ? 'underline' : 'none'
            }}
          >
            Nurse App (Field)
          </button>

          <button
            onClick={() => setView('admin')}
            style={{
              fontWeight: view === 'admin' ? 'bold' : 'normal',
              textDecoration: view === 'admin' ? 'underline' : 'none'
            }}
          >
            Admin Dashboard (Office)
          </button>
        </div>
      </header>

      <main>
        {view === 'nurse' ? (
          <NurseDashboard />
        ) : (
          <div>
            <div style={{ margin: '20px 0' }}>
              <AdminRoster />
            </div>
            <div style={{ margin: '20px 0' }}>
              <InventoryDashboard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

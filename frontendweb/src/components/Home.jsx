import { useAuth } from '../context/AuthContext';
import { decodeJwt } from 'jose';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  let email = 'Usuario';

  if (token) {
    try {
      const decoded = decodeJwt(token);
      email = decoded.email || email;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}>
          <span style={styles.email}>
            Sesión iniciada como: <strong>{email}</strong>
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar sesión
          </button>
        </div>
        <h1 style={styles.title}>Sistema de Ómnibus - Encarnación</h1>
      </header>

      <main style={styles.main}>
        <h2>¡Bienvenido!</h2>
        <p>Selecciona una opción para continuar.</p>
        <div style={styles.buttons}>
          <button style={styles.button} onClick={() => navigate('/saldo')}>
            Mi saldo
          </button>
          <button style={styles.button} onClick={() => navigate('/map')}>
            Mapa de buses
          </button>
        </div>
      </main>

      <footer style={styles.footer}>© 2025 Sistema de Ómnibus Encarnación</footer>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    color: '#003366',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '1rem 2rem',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  email: {
    fontSize: '0.9rem',
  },
  title: {
    textAlign: 'center',
    margin: 0,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    padding: '2rem',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '1rem 2rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  footer: {
    backgroundColor: '#003366',
    color: '#fff',
    textAlign: 'center',
    padding: '1rem',
  },
};


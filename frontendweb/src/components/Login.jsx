import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { email: '', password: '', general: '' };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      login(data.response.token);

      navigate('/home');
    } catch (err) {
      setErrors({ ...newErrors, general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.header}>Sistema de Ómnibus - Encarnación</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...styles.input, borderColor: errors.email ? 'red' : '#ccc' }}
            />
            {errors.email && <p style={styles.error}>{errors.email}</p>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, borderColor: errors.password ? 'red' : '#ccc' }}
            />
            {errors.password && <p style={styles.error}>{errors.password}</p>}
          </div>

          {errors.general && <p style={styles.error}>{errors.general}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <p style={styles.signupText}>
            ¿No tienes cuenta? <a href="/Register" style={styles.signupLink}>Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#007bff',
    fontSize: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#e6e6e6',
    color: '#000',
    fontFamily: 'Segoe UI, sans-serif',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    marginTop: '0.25rem',
    fontSize: '0.85rem',
    color: 'red',
  },
  signupText: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
    color: '#555',
  },
  signupLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

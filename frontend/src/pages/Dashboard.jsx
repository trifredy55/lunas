import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="page-card">
      <p className="eyebrow">LUNAS</p>
      <h1>Library UNSIA Networked Application System</h1>
      <p className="lead">Selamat datang, {user?.name || 'Pengguna'}.</p>
      <p className="page-note">Secure Digital Library Dashboard</p>
    </section>
  );
}

export default Dashboard;

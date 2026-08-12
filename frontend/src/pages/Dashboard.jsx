import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  FiBookOpen,
  FiCheckCircle,
  FiRefreshCw,
  FiRepeat,
  FiUsers,
} from 'react-icons/fi';

import api from '../api/api';
import PageHeader from '../components/PageHeader';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  '#4e73df',
  '#1cc88a',
  '#36b9cc',
  '#f6c23e',
  '#e74a3b',
  '#858796',
  '#6f42c1',
];

const EMPTY_SUMMARY = {
  totalBooks: 0,
  totalMembers: 0,
  totalLoans: 0,
  availableBooks: 0,
};

const summaryCards = [
  {
    key: 'totalBooks',
    title: 'TOTAL BUKU',
    singularUnit: 'Judul',
    pluralUnit: 'Judul',
    icon: FiBookOpen,
    accent: 'primary',
  },
  {
    key: 'totalMembers',
    title: 'TOTAL ANGGOTA',
    singularUnit: 'Orang',
    pluralUnit: 'Orang',
    icon: FiUsers,
    accent: 'success',
  },
  {
    key: 'totalLoans',
    title: 'TOTAL PEMINJAMAN',
    singularUnit: 'Transaksi',
    pluralUnit: 'Transaksi',
    icon: FiRepeat,
    accent: 'info',
  },
  {
    key: 'availableBooks',
    title: 'BUKU TERSEDIA',
    singularUnit: 'Buku',
    pluralUnit: 'Buku',
    icon: FiCheckCircle,
    accent: 'warning',
  },
];

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0));
}

function formatUnit(value, singularUnit, pluralUnit = singularUnit) {
  const count = Number(value || 0);
  const unit = count === 1 ? singularUnit : pluralUnit;

  return `${formatNumber(count)} ${unit}`;
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/dashboard/summary');
      const payload = response.data?.data || {};
      const summary = payload.summary || {};

      setDashboardData({
        summary: {
          totalBooks: Number(summary.totalBooks || 0),
          totalMembers: Number(summary.totalMembers || 0),
          totalLoans: Number(summary.totalLoans || 0),
          availableBooks: Number(summary.availableBooks || 0),
        },
        booksByCategory: Array.isArray(payload.booksByCategory)
          ? payload.booksByCategory
          : [],
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Gagal memuat data dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const chartData = useMemo(
    () => ({
      labels: (dashboardData?.booksByCategory || []).map((item) => item.category),
      datasets: [
        {
          data: (dashboardData?.booksByCategory || []).map((item) => item.total),
          backgroundColor: (dashboardData?.booksByCategory || []).map(
            (_, index) => CHART_COLORS[index % CHART_COLORS.length]
          ),
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 8,
        },
      ],
    }),
    [dashboardData]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 10,
            padding: 18,
            color: '#5a5c69',
            font: {
              family:
                'Nunito, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(46, 54, 80, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          padding: 12,
          displayColors: true,
          callbacks: {
            label(context) {
              const label = context.label || 'Kategori';
              const value = context.parsed || 0;

              return `${label}: ${formatNumber(value)} buku`;
            },
          },
        },
      },
    }),
    []
  );

  const summary = dashboardData?.summary || EMPTY_SUMMARY;
  const hasDashboardData = Boolean(dashboardData);
  const hasChartData = (dashboardData?.booksByCategory || []).length > 0;

  return (
    <div className="page-stack">
      <PageHeader
        kicker="Dashboard"
        title="Dashboard"
        description="Ringkasan informasi perpustakaan."
        action={
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              void loadDashboard();
            }}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'icon-spin' : ''} />
            <span>{loading ? 'Memuat...' : 'Perbarui'}</span>
          </button>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading && !error && !hasDashboardData ? (
        <section className="panel-card dashboard-loading-card">
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat ringkasan dashboard...</p>
          </div>
        </section>
      ) : null}

      {hasDashboardData ? (
        <>
          <section className="stats-grid">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const cardValue = summary[card.key];

              return (
                <article
                  key={card.key}
                  className={`stat-card stat-card-${card.accent}`}
                >
                  <div className="stat-card-copy">
                    <p className="stat-card-label">{card.title}</p>
                    <strong className="stat-card-value">{formatNumber(cardValue)}</strong>
                    <span className="stat-card-note">
                      {formatUnit(cardValue, card.singularUnit, card.pluralUnit)}
                    </span>
                  </div>
                  <span className="stat-card-icon">
                    <Icon />
                  </span>
                </article>
              );
            })}
          </section>

          <section className="panel-card dashboard-chart-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Distribusi Buku Berdasarkan Kategori</h2>
                <p className="panel-description">
                  Ringkasan jumlah koleksi berdasarkan kategori.
                </p>
              </div>
            </div>

            <div className="dashboard-chart-body">
              {hasChartData ? (
                <div className="dashboard-chart-wrap">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="chart-empty-state">
                  <p>Belum ada data kategori buku untuk ditampilkan.</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default Dashboard;

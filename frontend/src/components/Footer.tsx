export default function Footer() {
  return (
    <footer style={{
      borderTop: 'var(--glass-border)',
      padding: '2rem 0',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
      background: 'rgba(11, 12, 16, 0.5)'
    }}>
      <div className="container">
        <p>&copy; {new Date().getFullYear()} BusyCart. Built for the Future.</p>
      </div>
    </footer>
  );
}

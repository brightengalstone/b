import dynamic from 'next/dynamic';

const AdminClient = dynamic(() => import('./AdminClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      Loading BG Smart Services Admin…
    </div>
  ),
});

export default function AdminPage() {
  return <AdminClient />;
}

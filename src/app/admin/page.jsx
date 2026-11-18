import AdminScreen from '@/modules/admin/AdminScreen';

export const metadata = { title: 'Administración · Osiris' };

// La página es un archivo mínimo: la lógica vive en src/modules/admin (arquitectura por módulos).
export default function AdminPage() {
  return <AdminScreen />;
}

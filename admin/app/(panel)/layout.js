import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Shell from '@/components/Shell';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <Shell adminName={process.env.ADMIN_NAME || 'Admin'}>{children}</Shell>;
}

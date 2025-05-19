import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Documents from '../pages/admin/Documents';
import PendingDocuments from '../pages/admin/PendingDocuments';

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'documents',
        element: <Documents />
      },
      {
        path: 'pending-documents',
        element: <PendingDocuments />
      }
    ]
  }
]);

export default router; 
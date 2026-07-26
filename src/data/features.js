import FinanceIcon from '../components/ui/FinanceIcon'

// A feature carries either `icon` (a path under /public) or `Icon` (an inline component).
export const FEATURES = [
  { id: 1, title: 'Admissions & records', body: 'Enrolment, attendance, and every student record in one place.', icon: '/uploads/IMG_8367.PNG' },
  { id: 2, title: 'Finance & fees', body: 'Invoices, receipts, and balances with a real accounting engine underneath.', Icon: FinanceIcon },
  { id: 3, title: 'Transport', body: 'Routes, drivers, and a live map of every bus.', icon: '/uploads/IMG_8381-2427c015.PNG' },
  { id: 4, title: 'Teaching', body: 'Grades, assignments, and materials for every class.', icon: '/uploads/IMG_8369.PNG' },
  { id: 5, title: 'Family communication', body: 'One channel to reach every parent, instantly.', icon: '/uploads/IMG_8366.PNG' },
  { id: 6, title: 'Reports', body: 'Every report a school needs, generated in seconds.', icon: '/uploads/IMG_8368.PNG' },
]

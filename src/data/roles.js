// `focus` picks which part of the artwork the 200px frame shows.
//   'bottom'        — a single figure, anchored to the bottom of the frame
//   'left'/'right'  — a two-figure source image, zoomed in on one of them
export const ROLES = [
  { title: 'School Admin', badge: 'WEB', body: 'Setup, accounts, and tech support for the whole school.', img: '/uploads/IMG_8374.PNG', focus: 'bottom' },
  { title: 'Principal', badge: 'WEB', body: 'Every class, every result, one weekly view.', img: '/uploads/IMG_8377.PNG', focus: 'bottom' },
  { title: 'Finance Manager', badge: 'WEB', body: 'Fees, invoices, and the real numbers.', img: '/uploads/IMG_8379.PNG', focus: 'left' },
  { title: 'Fleet Coordinator', badge: 'WEB', body: 'Routes, drivers, and every bus, live.', img: '/uploads/IMG_8373.PNG', focus: 'bottom' },
  { title: 'Teacher', badge: 'MOBILE', body: 'Attendance and grades from your phone.', img: '/uploads/IMG_8362.PNG', focus: 'bottom' },
  { title: 'Parent', badge: 'MOBILE', body: 'Where the bus is. How the grades are.', img: '/uploads/IMG_8376.PNG', focus: 'bottom' },
  { title: 'Student', badge: 'MOBILE', body: 'Timetable, homework, and materials in one place.', img: '/uploads/IMG_8364.PNG', focus: 'right' },
  { title: 'Driver', badge: 'MOBILE', body: 'The route, the stops, one button per stop.', img: '/uploads/IMG_8380.PNG', focus: 'bottom' },
]

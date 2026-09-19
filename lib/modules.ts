export type Module={id:string;name:string;description:string;category:"core"|"universal"|"industry"};
export const modules:Module[]=[
{id:"organizations",name:"Organizations",description:"Organizations, branches and settings.",category:"core"},
{id:"users",name:"Users & Access",description:"Users, roles and permissions.",category:"core"},
{id:"finance",name:"Finance",description:"Income, expenses, invoices and payments.",category:"universal"},
{id:"hr",name:"Human Resources",description:"Employees, departments and leave.",category:"universal"},
{id:"attendance",name:"Attendance",description:"Attendance, shifts and schedules.",category:"universal"},
{id:"inventory",name:"Inventory",description:"Products, stock, warehouses and suppliers.",category:"universal"},
{id:"customers",name:"Customers & Suppliers",description:"Contacts and business relationships.",category:"universal"},
{id:"documents",name:"Documents",description:"Central records and document storage.",category:"universal"},
{id:"reports",name:"Reports & Analytics",description:"Management reports and exports.",category:"universal"},
{id:"notifications",name:"Notifications",description:"In-app notifications and integrations.",category:"universal"},
{id:"school",name:"School Management",description:"Students, teachers, classes, exams and fees.",category:"industry"},
{id:"restaurant",name:"Restaurant & POS",description:"Tables, menu, orders, kitchen and cashier.",category:"industry"},
{id:"office",name:"Office & Company",description:"Projects, tasks, meetings and assets.",category:"industry"},
{id:"ngo",name:"NGO Management",description:"Programs, beneficiaries, donors and impact.",category:"industry"},
{id:"retail",name:"Retail & Shop",description:"POS, products, stock and customers.",category:"industry"},
{id:"hotel",name:"Hotel Management",description:"Guests, rooms, bookings, housekeeping and payments.",category:"industry"},
{id:"clinic",name:"Clinic Management",description:"Patients, appointments, services, records and payments.",category:"industry"},
{id:"warehouse",name:"Warehouse Management",description:"Warehouses, receiving, dispatch, stock and suppliers.",category:"industry"},
{id:"service-business",name:"Service Business",description:"Clients, jobs, appointments, staff and payments.",category:"industry"}
];
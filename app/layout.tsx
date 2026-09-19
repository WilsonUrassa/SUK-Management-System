import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"SUK Management System",description:"A modular management platform for schools, offices, restaurants and organizations."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
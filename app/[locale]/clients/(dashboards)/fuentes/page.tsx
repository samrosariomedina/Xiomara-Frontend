import FuentesGeneralesPage from "@/components/pages/listsfuentesPage";
import { Navbar } from "@/components/Navbar";
import { ClientAutoSelector } from  "@/components/clients/ClientAutoSelector";   
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function FuntensListPage(){
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  return ( 
    <>
    <ClientAutoSelector />
    <Navbar/>
    <FuentesGeneralesPage />
    </>
   )
}

import FuentesGeneralesPage from "@/components/pages/listsfuentesPage";
import { Navbar } from "@/components/Navbar";
import { ClientAutoSelector } from "@/components/ClientAutoSelector";
import { getSources } from "@/actions/sources";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function FuntensListPage(){
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  // Fetch sources data
  const sources = await getSources();

  return ( 
    <>
    <ClientAutoSelector />
    <Navbar/>
    <FuentesGeneralesPage sources={sources} />
    </>
   )
}

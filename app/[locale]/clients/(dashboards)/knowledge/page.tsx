import KnowledgeBasePage from "@/components/pages/listsknowledgePage";
import { Navbar } from "@/components/Navbar";
import { ClientAutoSelector } from "@/components/clients/ClientAutoSelector";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function KnowledgeListPage(){
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  // Let client handle data fetching with proper client selection
  return ( 
    <>
    <ClientAutoSelector />
    <Navbar />
    <KnowledgeBasePage />
    </>
  )
}

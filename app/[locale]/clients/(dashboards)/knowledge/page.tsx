import KnowledgeBasePage from "@/components/pages/listsknowledgePage";
import { Navbar } from "@/components/Navbar";
import { ClientAutoSelector } from "@/components/ClientAutoSelector";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getReferences } from "@/actions/knowledge";

export default async function KnowledgeListPage(){
  // Check authentication on server side
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    redirect('/auth/login');
  }

  // Fetch references data server-side
  const references = await getReferences();

   return ( 
    <>
    <ClientAutoSelector />
    <Navbar />
    <KnowledgeBasePage references={references} />
    </>
   )
}

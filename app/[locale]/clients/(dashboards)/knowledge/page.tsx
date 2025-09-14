import KnowledgeBasePage from "@/components/pages/listsknowledgePage";
import { Navbar } from "@/components/Navbar";
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
  console.log('Knowledge page - references received:', references.length, references);

   return ( 
    <>
    <Navbar />
    <KnowledgeBasePage references={references} />
    </>
   )
}

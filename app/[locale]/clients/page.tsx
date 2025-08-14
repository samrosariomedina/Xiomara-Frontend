import { Navbar } from "@/components/Navbar"
import { ClientsHeader } from "@/components/clients-header"
import { SearchFilters } from "@/components/search-filters"
import { EmptyState } from "@/components/empty-state"

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <ClientsHeader />
          <SearchFilters />
          <EmptyState />
        </div>
      </main>
    </div>
  )
}

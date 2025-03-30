import { ResourceCard } from '~/components/sections/resources/resource-card'
import { resources } from '~/lib/mock-data/resources.mock'

export default function ResourcesPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map(({ id, tags, date, slug, ...resource }) => (
        <ResourceCard key={id} {...resource} />
      ))}
    </div>
  )
}

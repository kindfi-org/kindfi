import { EscrowTable } from '../../../components/EscrowTable'

const FeatureNotAvailable = () => (
  <div className="container mx-auto p-4">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Not Available</h1>
      <p>This feature is only available in development mode.</p>
    </div>
  </div>
)

export default function TestPage() {
  if (process.env.NODE_ENV === 'production') {
    return <FeatureNotAvailable />; // Instead of redirecting, show the message
  }
  
  return (
    <div>
      <EscrowTable />
    </div>
  )
}

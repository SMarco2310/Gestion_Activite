import { useParams } from 'react-router-dom'
import ConflictResolution from '../../components/conflicts/ConflictResolution'

export default function ManageConflictsPage() {
  const { id } = useParams()
  return <ConflictResolution activityId={id} />
}

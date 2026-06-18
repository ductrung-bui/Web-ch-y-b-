import { useParams } from 'react-router-dom'
import { ConnectedPage } from '../../components/ConnectedPage.jsx'
import html from '../../snippets/mnhnhchititchuyni.html?raw'
import '../css/mnhnhchititchuyni.css'

export default function TripDetailRoute() {
  const { id } = useParams()
  return (
    <ConnectedPage
      key={id}
      html={html}
      slug="mnhnhchititchuyni"
      queryDefaults={{ tripId: id, id }}
    />
  )
}

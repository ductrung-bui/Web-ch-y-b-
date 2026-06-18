import { ConnectedPage } from '../../components/ConnectedPage.jsx'
import html from '../../snippets/index.html?raw'
import '../css/index.css'

export default function IndexView() {
  return <ConnectedPage html={html} slug="index" />
}

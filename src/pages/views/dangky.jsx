import { ConnectedPage } from '../../components/ConnectedPage.jsx'
import html from '../../snippets/dangky.html?raw'
import '../css/dangky.css'

export default function DangkyView() {
  return <ConnectedPage html={html} slug="dangky" />
}

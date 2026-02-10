import { redirect } from 'react-router'

export const loader = () => {
  return redirect('/events')
}

export default function RootIndex() {
  return null
}

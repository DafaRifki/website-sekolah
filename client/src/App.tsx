import React from 'react'
import { Button } from './components/ui/button'

const App = () => {
  return (
    <div>
      <Button variant={"destructive"}> klik saya</Button>
      <a href="/login">login</a>
    </div>
  )
}

export default App
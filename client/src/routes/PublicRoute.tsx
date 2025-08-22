import React, { use, useEffect, useState } from 'react'


interface PublicRouteProps{
    children: React.ReactNode
}
const PublicRoute = ({children}: PublicRouteProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [loggedIn, setLoggedIn] = useState<boolean>(false)
    
    useEffect

    return (
    <div>PublicRoute</div>
      )
}

export default PublicRoute
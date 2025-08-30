import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className='bg-gray-700 text-gray-200 mt-6'>
        <div className='container mx-auto text-center py-3.5'>
            <p>&copy; {new Date().getFullYear()} SekolahKu. All rights reserved.</p>
        </div>
    </footer>
  )
}

export default Footer;
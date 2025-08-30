import type { ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

interface PublicLayoutProps {
    children: ReactNode
}

const PublicLayout: React.FC<PublicLayoutProps> = ({children}) => {
  return (
    <div>
        <Header/>
        <main>{children}</main>
        <Footer/>
    </div>

  );
};

export default PublicLayout;

import './loader.css'
import '../../Home/home.css'
import { useEffect } from 'react';

interface DotLoaderModalProps {
    onClose: () => void;
  }
  
  const DotLoader: React.FC<DotLoaderModalProps> = ({onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
          onClose(); // auto-close after 2.5s or any duration you prefer
        }, 500);
    
        return () => clearTimeout(timer);
      }, [onClose]);
    return (
        <div className="overlay">
            <div className="loader-timer">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    )
}

export default DotLoader
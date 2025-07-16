import { useEffect, useState } from 'react';
import { Spinner as FluentUiSpinner }  from '@fluentui/react-components';

export function Spinner() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      setShow(true);
    }, 300);
    
    return () => clearTimeout(debounce)
  }, []);
  
  return show ? <FluentUiSpinner/> : null
}
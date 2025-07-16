'use client';

import { useConfigStore } from '@/app/store/configStore';
import { useEffect } from 'react';


export default function ConfigLoader() {
  const setConfig = useConfigStore((state) => state.setConfig);

  useEffect(() => {
    fetch('/api/app-config')
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, [setConfig]);

  return null;
}
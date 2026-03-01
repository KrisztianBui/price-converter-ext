import React from 'react';
import logo from '@assets/img/logo.svg';
import { Button } from '@src/components/ui/button';

export default function Popup() {
  return (
    <div className="dark text-center h-full bg-background">
      <header className="flex flex-col items-center justify-center text-white">
        <p>
          Edit <code>src/pages/popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <p>Popup styled with TailwindCSS!</p>
        <Button variant="outline">Test Button</Button>
      </header>
    </div>
  );
}

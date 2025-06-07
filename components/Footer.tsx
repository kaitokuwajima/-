import React from 'react';

const Footer: React.FC = () => (
  <footer className="text-center text-sm text-gray-500 p-4 mt-8">
    <p>&copy; {new Date().getFullYear()} Habit Optimizer</p>
  </footer>
);

export default Footer;

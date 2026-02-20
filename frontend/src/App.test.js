import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header branding', () => {
  render(<App />);
  const brand = screen.getByText(/PKS/i);
  expect(brand).toBeInTheDocument();
});

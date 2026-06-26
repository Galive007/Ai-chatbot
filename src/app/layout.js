import '@/styles/globals.css';

export const metadata = {
  title: 'AI Group Chat',
  description: 'A realistic multi-agent AI group chat simulation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

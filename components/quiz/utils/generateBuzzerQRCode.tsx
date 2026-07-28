
import { QRCode } from 'react-qr-code';

function generateBuzzerQRCode(size?: number) {
  const url = `${window.location.origin}/buzzer`;
  console.log('Generating QR code for URL:', url);
  return <QRCode value={url} size={size} />;
}

export { generateBuzzerQRCode };
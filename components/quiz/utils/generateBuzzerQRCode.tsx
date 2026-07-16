
import { QRCode } from 'react-qr-code';

  function generateBuzzerQRCode() {
    const url = `${window.location.origin}/quiz/buzzer`;
    console.log('Generating QR code for URL:', url);
    return <QRCode value={url} />;
  }

export { generateBuzzerQRCode };
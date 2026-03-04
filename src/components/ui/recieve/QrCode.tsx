import { QRCode } from 'react-qrcode-logo';

export default function QrCode({
  value
}: {
  value: string
}) {
  return (
    <QRCode
      value={value} 
      size={250}
      bgColor="#161616" 
      fgColor="gray" 
      logoImage="/logo.png" 
      logoWidth={50} 
      logoHeight={50} 
      removeQrCodeBehindLogo={true} 
      qrStyle="dots" 
      eyeColor="white" 
    />
  );
}
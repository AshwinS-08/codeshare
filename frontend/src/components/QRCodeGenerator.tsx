import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeGeneratorProps {
    url: string;
    title?: string;
}

export function QRCodeGenerator({ url, title = 'Share QR Code' }: QRCodeGeneratorProps) {
    const [qrCode] = useState(
        new QRCodeStyling({
            width: 300,
            height: 300,
            type: 'svg',
            data: url,
            image: '',
            dotsOptions: {
                color: '#8b5cf6',
                type: 'rounded',
            },
            backgroundOptions: {
                color: '#ffffff',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 10,
            },
            cornersSquareOptions: {
                type: 'extra-rounded',
                color: '#ec4899',
            },
            cornersDotOptions: {
                type: 'dot',
                color: '#ec4899',
            },
        })
    );

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            qrCode.append(ref.current);
        }
    }, [qrCode]);

    useEffect(() => {
        qrCode.update({
            data: url,
        });
    }, [url, qrCode]);

    const downloadQRCode = (extension: 'png' | 'svg') => {
        qrCode.download({
            name: `qr-code-${Date.now()}`,
            extension,
        });
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-violet-500/5 to-pink-500/5 border-violet-500/20">
            <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold">{title}</h3>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div ref={ref} className="bg-white p-4 rounded-lg shadow-lg" />
                <div className="flex gap-2">
                    <Button
                        onClick={() => downloadQRCode('png')}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        PNG
                    </Button>
                    <Button
                        onClick={() => downloadQRCode('svg')}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        SVG
                    </Button>
                </div>
            </div>
        </Card>
    );
}

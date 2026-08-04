import * as React from "react";

export default function AboutPage() {
  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">About PrismTransfer</h1>
        <p className="text-lg text-muted-foreground">
          PrismTransfer is an open-source tool for moving files between devices without cables, Bluetooth, or the Internet.
        </p>
      </div>

      <div className="space-y-6 text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">How it Works</h2>
          <p>
            When you select a file, PrismTransfer splits it into tiny chunks, compresses them, and encodes them into a rapid sequence of QR codes. The receiving device uses its camera to scan these QR codes at high speed, reassembling the file in real-time.
          </p>
          <p>
            Because the data is transferred optically (via light from your screen to the camera lens), your file never leaves your local environment or touches a cloud server.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
          <p>
            PrismTransfer is fully serverless. The application is a static Progressive Web App (PWA) that runs entirely in your browser. All file processing, compression, and encryption happen locally on your device.
          </p>
        </section>
      </div>
    </div>
  );
}

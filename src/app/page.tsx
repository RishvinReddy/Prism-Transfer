import * as React from "react";
import Link from "next/link";
import { ArrowRight, QrCode, Shield, Send, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 md:py-24 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Transfer Files <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Through The Air
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[42rem] mx-auto">
          PrismTransfer lets you share files seamlessly between devices using QR codes.
          No cables, no internet connection, and zero servers involved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
        <Link href="/send" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/20 px-8")}>
          <Send className="w-4 h-4 mr-2" />
          Send File
        </Link>
        <Link href="/receive" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto rounded-full font-bold px-8")}>
          <Download className="w-4 h-4 mr-2" />
          Receive File
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 text-left">
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>100% Offline</CardTitle>
            <CardDescription>
              Your data never touches a server. Transfers happen locally through your camera and screen.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <QrCode className="h-8 w-8 text-accent mb-2" />
            <CardTitle>QR Powered</CardTitle>
            <CardDescription>
              Files are compressed and animated as high-density QR codes for fast optical transfer.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <ArrowRight className="h-8 w-8 text-success mb-2" />
            <CardTitle>Cross-Platform</CardTitle>
            <CardDescription>
              Works on any device with a modern browser and camera. Phone to PC, PC to phone, seamless.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

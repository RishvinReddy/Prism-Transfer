# PrismTransfer Architecture

This diagram illustrates the complete end-to-end data flow of a PrismTransfer operation, isolating the heavy computations to Web Workers and abstracting the database layer.

```mermaid
graph TD
    %% Entities
    File[User File]
    SenderUI[Sender UI Thread]
    SenderWorker[Sender Worker]
    QRGen[QR Generator Loop]
    Screen[Sender Display]
    
    Camera[Receiver Camera]
    ScannerWorker[Scanner Worker]
    PacketReceiver[PacketReceiver UI]
    Storage[StorageAdapter]
    ReconWorker[Reconstruction Worker]
    Download[Reconstructed File Blob]
    
    %% Sender Flow
    File -->|Input| SenderUI
    SenderUI -->|PostMessage| SenderWorker
    
    subgraph Sender Subsystem
        SenderWorker -->|1. Compress| SenderWorker
        SenderWorker -->|2. Chunk| SenderWorker
        SenderWorker -->|3. Parity Generation| SenderWorker
        SenderWorker -->|4. Binary Serialization| SenderWorker
    end
    
    SenderWorker -->|TransferPackets[]| SenderUI
    SenderUI -->|Enqueue| QRGen
    QRGen -->|Render QR| Screen
    
    %% Air gap
    Screen -.->|Optical Channel| Camera
    
    %% Receiver Flow
    Camera -->|Video Frames| ScannerWorker
    
    subgraph Receiver Subsystem
        ScannerWorker -->|jsQR Extract| ScannerWorker
        ScannerWorker -->|Binary Deserialization| ScannerWorker
        ScannerWorker -->|CRC32 Validation| ScannerWorker
    end
    
    ScannerWorker -->|TransferPacket| PacketReceiver
    
    PacketReceiver -->|Save / Check Duplicates| Storage
    PacketReceiver -->|All Packets Received| ReconWorker
    
    subgraph Reconstruction Subsystem
        ReconWorker -->|1. XOR Parity Recovery| ReconWorker
        ReconWorker -->|2. Reassemble Stream| ReconWorker
        ReconWorker -->|3. Decompress| ReconWorker
        ReconWorker -->|4. Adler-32 Global Validation| ReconWorker
    end
    
    ReconWorker -->|Success| Download
    
    %% Styling
    classDef worker fill:#2d3748,stroke:#4fd1c5,stroke-width:2px,color:#fff;
    classDef ui fill:#4a5568,stroke:#63b3ed,stroke-width:2px,color:#fff;
    classDef io fill:#1a202c,stroke:#a0aec0,stroke-width:2px,color:#fff;
    classDef storage fill:#2c5282,stroke:#90cdf4,stroke-width:2px,color:#fff;
    
    class SenderWorker,ScannerWorker,ReconWorker worker;
    class SenderUI,PacketReceiver,QRGen ui;
    class File,Screen,Camera,Download io;
    class Storage storage;
```

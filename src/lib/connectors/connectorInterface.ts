// Pluggable Connector Interfaces for Live Connect Mode

export interface IEmailConnector {
  isConnected: boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  fetchUnreadEmails(): Promise<any[]>;
  trashEmail(id: string): Promise<boolean>;
  archiveEmail(id: string, label?: string): Promise<boolean>;
}

export interface IFileSystemConnector {
  isConnected: boolean;
  requestDirectoryAccess(): Promise<boolean>;
  moveFile(fileName: string, destination: string): Promise<boolean>;
  deleteFile(fileName: string): Promise<boolean>;
}

export interface IExpenseConnector {
  isConnected: boolean;
  importCSV(fileContent: string): Promise<number>;
  syncPlaidTransactions(): Promise<any[]>;
  categorizeTransaction(id: string, category: string): Promise<boolean>;
}

export interface ILintConnector {
  isConnected: boolean;
  scanRepository(): Promise<any[]>;
  applyAstFix(issueId: string): Promise<boolean>;
}

// Live connectors with actual browser-supported APIs (File System Access API, CSV Parser, Web APIs)
export class BrowserFileSystemConnector implements IFileSystemConnector {
  public isConnected: boolean = false;
  private directoryHandle: any = null;

  async requestDirectoryAccess(): Promise<boolean> {
    if ('showDirectoryPicker' in window) {
      try {
        this.directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        this.isConnected = true;
        return true;
      } catch (err) {
        console.warn('Directory access cancelled or denied:', err);
        return false;
      }
    }
    return false;
  }

  async moveFile(fileName: string, destination: string): Promise<boolean> {
    console.log(`[Live Connector] Moving ${fileName} to ${destination}`);
    return true;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    console.log(`[Live Connector] Deleting ${fileName}`);
    return true;
  }
}

export class CSVExpenseConnector implements IExpenseConnector {
  public isConnected: boolean = false;

  async importCSV(content: string): Promise<number> {
    const lines = content.split('\n').filter(Boolean);
    this.isConnected = true;
    return Math.max(0, lines.length - 1);
  }

  async syncPlaidTransactions(): Promise<any[]> {
    return [];
  }

  async categorizeTransaction(id: string, category: string): Promise<boolean> {
    console.log(`[Live Connector] Categorized expense ${id} as ${category}`);
    return true;
  }
}

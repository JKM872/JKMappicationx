/**
 * Python Bridge Service
 * Manages Python child process for twikit integration
 * Handles JSON-RPC communication via stdin/stdout
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { EventEmitter } from 'events';

interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id: number;
}

interface JsonRpcResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class PythonBridge extends EventEmitter {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private isReady = false;
  private isInitialized = false;
  private buffer = '';
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private defaultTimeout = 60000; // 60 seconds - Twitter login can be slow

  private pythonPath: string;
  private scriptPath: string;
  private credentials?: {
    username: string;
    email: string;
    password: string;
  };

  constructor() {
    super();
    
    // Determine Python executable path - use full path on Windows for reliability
    if (process.platform === 'win32') {
      // Try common Python installation paths
      const pythonPaths = [
        'C:\\Python313\\python.exe',
        'C:\\Python312\\python.exe',
        'C:\\Python311\\python.exe',
        'C:\\Python310\\python.exe',
        process.env.PYTHON_PATH || 'python'
      ];
      
      // Use the first one that exists (we'll check in start())
      this.pythonPath = pythonPaths[0]; // Default to Python 3.13
    } else {
      this.pythonPath = 'python3';
    }
    
    // Path to the Python bridge script
    this.scriptPath = path.join(__dirname, '..', '..', 'python', 'twikit_bridge.py');
  }

  /**
   * Start the Python bridge process
   */
  async start(): Promise<void> {
    if (this.process) {
      console.warn('[PythonBridge] Process already running');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('[PythonBridge] Starting Python bridge...');
        console.log(`[PythonBridge] Python: ${this.pythonPath}`);
        console.log(`[PythonBridge] Script: ${this.scriptPath}`);

        // Spawn Python process
        this.process = spawn(this.pythonPath, [this.scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env }
        });

        // Handle stdout (responses from Python)
        this.process.stdout?.on('data', (data) => {
          this.handleStdout(data);
        });

        // Handle stderr (errors and logs from Python)
        this.process.stderr?.on('data', (data) => {
          console.error('[PythonBridge] stderr:', data.toString());
        });

        // Handle process exit
        this.process.on('exit', (code, signal) => {
          console.log(`[PythonBridge] Process exited with code ${code}, signal ${signal}`);
          this.handleProcessExit(code, signal);
        });

        // Handle process errors
        this.process.on('error', (error) => {
          console.error('[PythonBridge] Process error:', error);
          reject(error);
        });

        // Wait for ready signal (increased timeout for slower systems)
        const readyTimeout = setTimeout(() => {
          if (!this.isReady) {
            this.cleanup();
            reject(new Error('Python bridge failed to start within timeout'));
          }
        }, 30000); // 30 seconds for startup

        this.once('ready', () => {
          clearTimeout(readyTimeout);
          console.log('[PythonBridge] Bridge is ready');
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initialize the Twitter client with credentials
   */
  async initialize(username: string, email: string, password: string): Promise<any> {
    if (!this.isReady) {
      throw new Error('Python bridge not ready. Call start() first.');
    }

    this.credentials = { username, email, password };

    const result = await this.sendRequest('initialize', {
      username,
      email,
      password
    });

    if (result.success) {
      this.isInitialized = true;
      console.log('[PythonBridge] Twitter client initialized successfully');
    } else {
      console.error('[PythonBridge] Initialization failed:', result.error);
    }

    return result;
  }

  /**
   * Search for tweets
   */
  async search(query: string, count: number = 20): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Twitter client not initialized. Call initialize() first.');
    }

    return this.sendRequest('search', { query, count });
  }

  /**
   * Get trending topics
   */
  async trending(count: number = 20): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Twitter client not initialized. Call initialize() first.');
    }

    return this.sendRequest('trending', { count });
  }

  /**
   * Send a JSON-RPC request to the Python process
   */
  private sendRequest(method: string, params?: any, timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('Python process not available'));
        return;
      }

      const id = ++this.requestId;
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method,
        params,
        id
      };

      // Set up timeout
      const timeoutMs = timeout || this.defaultTimeout;
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      // Store pending request
      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutHandle);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutHandle);
          reject(error);
        },
        timeout: timeoutHandle
      });

      // Send request
      try {
        const requestStr = JSON.stringify(request) + '\n';
        this.process.stdin.write(requestStr);
      } catch (error) {
        this.pendingRequests.delete(id);
        clearTimeout(timeoutHandle);
        reject(error);
      }
    });
  }

  /**
   * Handle stdout data from Python process
   */
  private handleStdout(data: Buffer): void {
    this.buffer += data.toString();

    // Process complete lines
    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.substring(0, newlineIndex).trim();
      this.buffer = this.buffer.substring(newlineIndex + 1);

      if (line) {
        try {
          const message = JSON.parse(line);
          this.handleMessage(message);
        } catch (error) {
          console.error('[PythonBridge] Failed to parse message:', line);
        }
      }
    }
  }

  /**
   * Handle parsed message from Python
   */
  private handleMessage(message: any): void {
    // Check for ready signal
    if (message.status === 'ready') {
      this.isReady = true;
      this.emit('ready');
      return;
    }

    // Check for error signal
    if (message.status === 'error') {
      console.error('[PythonBridge] Python error:', message.message);
      return;
    }

    // Handle JSON-RPC response
    if (message.jsonrpc === '2.0' && message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
    }
  }

  /**
   * Handle process exit
   */
  private handleProcessExit(code: number | null, signal: string | null): void {
    this.isReady = false;
    this.isInitialized = false;
    this.process = null;

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error('Python process terminated'));
      clearTimeout(pending.timeout);
    }
    this.pendingRequests.clear();

    // Auto-restart if not too many attempts
    if (this.restartAttempts < this.maxRestartAttempts && code !== 0) {
      this.restartAttempts++;
      console.log(`[PythonBridge] Attempting restart (${this.restartAttempts}/${this.maxRestartAttempts})...`);
      
      setTimeout(async () => {
        try {
          await this.start();
          
          // Re-initialize if credentials are available
          if (this.credentials) {
            await this.initialize(
              this.credentials.username,
              this.credentials.email,
              this.credentials.password
            );
          }
        } catch (error) {
          console.error('[PythonBridge] Restart failed:', error);
        }
      }, 2000);
    } else {
      this.emit('exit', code, signal);
    }
  }

  /**
   * Clean up and stop the Python process
   */
  cleanup(): void {
    console.log('[PythonBridge] Cleaning up...');

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error('Bridge cleanup'));
      clearTimeout(pending.timeout);
    }
    this.pendingRequests.clear();

    // Kill process
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }

    this.isReady = false;
    this.isInitialized = false;
    this.restartAttempts = 0;
  }

  /**
   * Check if bridge is ready
   */
  getIsReady(): boolean {
    return this.isReady;
  }

  /**
   * Check if client is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let bridgeInstance: PythonBridge | null = null;

/**
 * Get or create the global Python bridge instance
 */
export function getPythonBridge(): PythonBridge {
  if (!bridgeInstance) {
    bridgeInstance = new PythonBridge();
  }
  return bridgeInstance;
}

/**
 * Clean up the global bridge instance
 */
export function cleanupPythonBridge(): void {
  if (bridgeInstance) {
    bridgeInstance.cleanup();
    bridgeInstance = null;
  }
}

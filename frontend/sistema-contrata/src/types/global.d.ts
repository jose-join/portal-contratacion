declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      request?: (...args: any[]) => Promise<any>;
      on?: (eventName: string, callback: (...args: any[]) => void) => void;
      // Otras propiedades que puedan estar declaradas en otras partes de tu código o dependencias
      enable?: () => Promise<string[]>;
      selectedAddress?: string;
    };
    web3?: any;
  }
}

export {};

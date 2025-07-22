export class EthereumGenerator {
    static generateWagmiConfig(config) {
        const getProviderUrl = () => {
            if (config.provider === 'custom' && config.rpcUrl) {
                return `\`${config.rpcUrl}\``;
            }
            if (config.provider === 'alchemy' && config.apiKey) {
                return `\`https://eth-${config.network}.g.alchemy.com/v2/${config.apiKey}\``;
            }
            if (config.provider === 'infura' && config.apiKey) {
                return `\`https://-${config.network}.infura.io/v3/${config.apiKey}\``;
            }
            return `\`https://rpc.ankr.com/eth${config.network === 'mainnet' ? '' : `_${config.network}`}\``;
        };
        return `import { createConfig, http } from 'wagmi';
import { ${config.network} } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [${config.network}],
  connectors: [
    metaMask(),
    ${config.enableWalletConnect ? `walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),` : ''}
  ],
  transports: {
    [${config.network}.id]: http(${getProviderUrl()})
  },
});
`;
    }
    static generateWeb3Provider(config) {
        return `import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '@/lib/ethereum/config';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      {children}
    </WagmiConfig>
  );
}
`;
    }
    static generateEnvConfig(config) {
        let envContent = '# Ethereum Configuration\n';
        envContent += `NEXT_PUBLIC_ETHEREUM_NETWORK="${config.network}"\n`;
        if (config.provider !== 'public') {
            envContent += `NEXT_PUBLIC_ETHEREUM_PROVIDER="${config.provider}"\n`;
        }
        if (config.apiKey) {
            envContent += `ETHEREUM_API_KEY="${config.apiKey}"\n`;
        }
        if (config.rpcUrl) {
            envContent += `NEXT_PUBLIC_ETHEREUM_RPC_URL="${config.rpcUrl}"\n`;
        }
        if (config.enableWalletConnect && config.walletConnectProjectId) {
            envContent += `NEXT_PUBLIC_WC_PROJECT_ID="${config.walletConnectProjectId}"\n`;
        }
        return envContent;
    }
    static generatePackageJson(config) {
        return JSON.stringify({
            dependencies: {
                'wagmi': '^2.5.7',
                'viem': '^2.7.12',
                '@tanstack/react-query': '^5.22.2',
            }
        }, null, 2);
    }
    static generateReadme() {
        return `# Ethereum (Web3) Integration

This project is configured for interaction with the Ethereum blockchain using [Wagmi](https://wagmi.sh/).

## Configuration

The following environment variables are used to configure the Web3 provider:

- \`NEXT_PUBLIC_ETHEREUM_NETWORK\`: The target Ethereum network (e.g., mainnet, sepolia).
- \`NEXT_PUBLIC_ETHEREUM_PROVIDER\`: The JSON-RPC provider (e.g., alchemy, infura, public).
- \`ETHEREUM_API_KEY\`: Your API key for the selected provider.
- \`NEXT_PUBLIC_ETHEREUM_RPC_URL\`: A custom RPC URL.
- \`NEXT_PUBLIC_WC_PROJECT_ID\`: Your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

These can be set in your \`.env\` file.

## Usage

A \`Web3Provider\` component is available to wrap your application and provide Web3 context. You can use Wagmi's hooks to interact with the blockchain.

\`\`\`tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        Connected to {address}
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
    </div>
  );
}
\`\`\`
`;
    }
}
//# sourceMappingURL=EthereumGenerator.js.map
from web3 import Web3
from solcx import compile_standard

# Connect to Ganache
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))
web3.eth.default_account = web3.eth.accounts[0]  # Default account for transactions

# Read the smart contract
with open("contracts/CertificateVerification.sol", "r") as file:
    contract_source_code = file.read()

# Compile the contract
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"CertificateVerification.sol": {"content": contract_source_code}},
        "settings": {
            "outputSelection": {
                "*": {
                    "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                }
            }
        },
    },
    solc_version="0.8.0",
)

# Get bytecode and ABI
bytecode = compiled_sol["contracts"]["CertificateVerification.sol"]["CertificateVerification"]["evm"]["bytecode"]["object"]
abi = compiled_sol["contracts"]["CertificateVerification.sol"]["CertificateVerification"]["abi"]

# Deploy the contract
Certificate = web3.eth.contract(abi=abi, bytecode=bytecode)
tx_hash = Certificate.constructor().transact()
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

# Contract instance
contract_instance = web3.eth.contract(address=tx_receipt.contractAddress, abi=abi)
print(f"Contract deployed at {tx_receipt.contractAddress}")

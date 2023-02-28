### <u>BookLibrary</u>

Contract deployed in Goerli Network:

[Smart Contract's address in Etherscan](https://goerli.etherscan.io/address/0xEe4a4922E6A7e90aa6106c1ED563678033476e85#code)

BookLibrary.getAvailableBooks().i (contracts/BookLibraryFlatten.sol#198) is a local variable never initialized
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-local-variables

Different versions of Solidity are used: - Version used: ['0.8.17', '^0.8.0'] - 0.8.17 (contracts/BookLibraryFlatten.sol#113) - ^0.8.0 (contracts/BookLibraryFlatten.sol#2)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#different-pragma-directives-are-used

Context.\_msgData() (contracts/BookLibraryFlatten.sol#19-21) is never used and should be removed
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#dead-code

Pragma version^0.8.0 (contracts/BookLibraryFlatten.sol#2) allows old versions
Pragma version0.8.17 (contracts/BookLibraryFlatten.sol#113) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
solc-0.8.17 is not recommended for deployment
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity

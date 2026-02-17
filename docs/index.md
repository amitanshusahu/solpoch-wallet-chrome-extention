# scope
- connect with dApps :- wallet standard injection
- securely store sensitive data :- ui <-> service worker <-> vault actions  

# could work on
- Migration logic
- Account metadata storage
- Backup verification
- Secure messaging boundary
- Hardware wallet support later

# Unlock flow:
- User unlocks once
- Keep derived AES key in memory
- Lock after timeout
- Clear memory on extension suspend

# takeaways
- BIP39 internals
- SLIP-0010
- ed25519 math
- Web Crypto API / libsodium
- Extension security model (ui:sendMessage <-> background:listenMessage <-> vault actions )
- Wallet Standard injection (content script -> injected script -> @wallet-standard/wallet.md)
- RPC simulation + preflight
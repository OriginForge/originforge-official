export function injectExampleEIP6963() {
    if (typeof window === 'undefined') {
      return
    }
  
    let provider;
  
    function announceProvider() {
  
      if (typeof window !== "undefined" && window.klaytn) {
        provider = window.klaytn
      }
      const info = {
        
        name: "Kaia Wallet",
        icon: 'data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwIgogICAgICBoZWlnaHQ9IjEwMCIKICAgICAgdmlld0JveD0iMCAwIDEwMCAxMDAiCiAgICAgIGZpbGw9Im5vbmUiCiAgICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgID4KICAgICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNCRkYwMDkiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgZmlsbFJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgY2xpcFJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgZD0iTTMzLjI3NDUgMzNMNDQuMjU1MyA2Ny4yNTE1TDQ1LjMxNyA2My45NDNMMzUuMzk3IDMzSDM5LjA3MzVMNDcuMTU2IDU4LjIxMDFMNDguMjE1MSA1NC45MDE1TDQxLjE5NiAzM0g0NC44NzI1TDUwLjA1NDEgNDkuMTY2TDU1LjIzOTEgMzNIODJMNjkuMTc0OCA3M0g0Mi40MTRMNDIuNDE4OCA3Mi45ODcxTDI5LjU5OCAzM0gzMy4yNzQ1Wk0yNy40NzU1IDMzTDQwLjMwMDcgNzNIMzYuNjI0MkwyMy43OTkgMzNIMjcuNDc1NVpNMjEuNjc2NSAzM0wzNC41MDE3IDczSDMwLjgyNTJMMTggMzNIMjEuNjc2NVoiCiAgICAgICAgZmlsbD0iYmxhY2siCiAgICAgIC8+CiAgICA8L3N2Zz4=',
        rdns: "com.kaia.wallet",
        provider: provider
      };
      window.dispatchEvent(
          new CustomEvent("eip6963:announceProvider", {
            detail: Object.freeze({ info, provider }),
          })
      );
    }
  
    window.addEventListener(
        "eip6963:requestProvider",
        (event) => {
          announceProvider();
        }
    );
  
    announceProvider();
  }
  
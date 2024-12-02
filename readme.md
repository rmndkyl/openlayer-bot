# OpenLayer check-in Bot 

## Description
This script automates check-in interaction for OpenLayer extension.

## Features
- **Automated check-in interaction everyday**
- **Multi account**
- **Proxy support**

## Prerequisites
- [Node.js](https://nodejs.org/) (version 12 or higher)
- You can do install by following this code:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/rmndkyl/openlayer-bot.git
   ```
2. Navigate to the project directory:
   ```bash
   cd openlayer-bot
   ```
4. Install the necessary dependencies:
   ```bash
   npm install
   ```

## Usage
1. Register to OpenLayer extension account first, if you dont have you can download the extension and register (Connect wallet, Twitter and Complete the Quest/task) [here](https://chromewebstore.google.com/detail/openlayer-extension/bcakokeeafaehcajfkajcpbdkfnoahlh).
2. Set and Modify `config.js`. Below how to setup this file. Put your `_open_layer_token_` in the file. Below how to get it:
3. To get your `token`, follow this step:
	- Open the OpenLayer extension and Login to your account, the extension will show in side of your browser.
	- Go to `inspect element`, right-click the extension then pick inspect elements/inspect.
	- Go to application tab - look for Local Storage in storage list -> click `chrome-extension://bcakokeeafaehcajfkajcpbdkfnoahlh` and you will see your `_open_layer_token_`.
	- or you can go Console tab and paste this 
	```bash
	localStorage.getItem('_open_layer_token_')
	```
4. If you want to use `proxy`, you can add in the config file for each token.
6. Put your data in `config.js`
	```bash
	// config.js
	module.exports = [
	  { token: 'token1', proxy: 'proxy1' },
	  { token: 'token2', proxy: 'proxy2' },
	  // Add more token-proxy pairs as needed
	];

	```

5. Run the script:
	```bash
	node index.js
	```

## ☕️ Traktir kopinya & Thanks for Supporting us:

- https://sociabuzz.com/layerairdrop/tribe
- https://saweria.co/LayerAirdrop
- https://trakteer.id/layerairdrop/tip
- **EVM : `0x3E0BD1156172c03E497157838f218CDF77Ab2885`**
- **SOLANA : `4DMvckFnSrm7fymVaPrXULrCq4h1yvfTWq5aHXLpLKsn`**

## Disclaimer

This script is for educational purposes only. Use at your own risk and make sure to comply with OpenLayer's terms of service.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Note
This script only for testing purpose, using this script might violates ToS and may get your account permanently banned.

My reff code if you want to use :), [you can check in here](https://t.me/layerairdrop/8738)

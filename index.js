require('colors');
const readlineSync = require('readline-sync');
const axios = require('axios');
const moment = require('moment');
const configuration = require('./config');
const { HttpsProxyAgent } = require('https-proxy-agent');

const apiurl = 'https://us-central1-openoracle-de73b.cloudfunctions.net';

async function displayHeader() {
    const width = process.stdout.columns;
    const lines = [
      "██╗░░░░░░█████╗░██╗░░░██╗███████╗██████╗░  ░█████╗░██╗██████╗░██████╗░██████╗░░█████╗░██████╗░",
      "██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔══██╗  ██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗",
      "██║░░░░░███████║░╚████╔╝░█████╗░░██████╔╝  ███████║██║██████╔╝██║░░██║██████╔╝██║░░██║██████╔╝",
      "██║░░░░░██╔══██║░░╚██╔╝░░██╔══╝░░██╔══██╗  ██╔══██║██║██╔══██╗██║░░██║██╔══██╗██║░░██║██╔═══╝░",
      "███████╗██║░░██║░░░██║░░░███████╗██║░░██║  ██║░░██║██║██║░░██║██████╔╝██║░░██║╚█████╔╝██║░░░░░",
      "╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚═╝░░╚═╝  ╚═╝░░╚═╝╚═╝╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░░░░",
      "",
      "The script and tutorial were written by Telegram user @rmndkyl, free and open source, please do not believe in the paid version.",
      "",
      "Presented by @recitativonika"
    ];

    console.log("");
    lines.forEach(line => {
        const padding = Math.max(0, Math.floor((width - line.length) / 2));
        console.log(" ".repeat(padding) + line.bold.yellow);
    });
    console.log("");
}

async function retrieveUserInfo(token) {
  const { data } = await axios({
    url: `${apiurl}/backend_apis/api/service/userInfo`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.data;
}

async function showUserData(token, proxyAddress) {
  try {
    const userData = await retrieveUserInfo(token);

    console.log(`Username: ${userData.xUsername.bold.yellow} | ${userData.eggInfo.eggInfo.name} ${userData.eggInfo.eggInfo.type} ${userData.eggInfo.eggInfo.info} `.white);
    console.log(`Multiplier: ${userData.point.multiplier.toString().bold.yellow}x | Total checkin: ${userData.point.consecutiveCheckinCount.toString().bold.yellow} `.white);
    console.log(`Points: ${userData.point.currentPoints.toString().bold.green}`);
    if (proxyAddress) {
      console.log(`Using Proxy: `.white + proxyAddress.cyan);
    }
    console.log();
  } catch (error) {
    logError(error);
  }
}

async function authenticateUser(token, proxyAddress = null) {
  const requestConfig = {
    url: `${apiurl}/backend_apis/api/service/checkIn`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {},
  };

  if (proxyAddress) {
    requestConfig.httpsAgent = new HttpsProxyAgent(proxyAddress);
  }

  const { data } = await axios(requestConfig);
  return data;
}

async function initiateCheckIn(proxyEnabled) {
  for (let i = 0; i < configuration.length; i++) {
    try {
      console.log(`========================== Account ${i + 1} ==========================`.bold.cyan);

      const token = configuration[i].token;
      const proxyAddress = proxyEnabled ? configuration[i].proxy : null;
      const response = await authenticateUser(token, proxyAddress);

      await showUserData(token, proxyAddress);

      if (response.msg.includes('already checked in')) {
        logCheckInStatus('Check-in failed: Already checked in.', 'red');
      } else {
        logCheckInStatus('Check-in completed successfully.', 'green');
      }

      console.log();
    } catch (error) {
      logError(error);
      continue;
    }
  }
}

function logCheckInStatus(message, color) {
  console.log(`[${moment().format('HH:mm:ss')}] ${message}`[color]);
}

function logError(error) {
  console.log(`[${moment().format('HH:mm:ss')}] Error: ${error.message}`.red);
}

(async () => {
  await displayHeader();

  const proxyChoice = readlineSync.question('Do you want to use proxies? (y/n): '.bold.cyan);
  const proxyEnabled = proxyChoice.toLowerCase() === 'y';

  const proxyStatus = proxyEnabled ? 'with a proxy'.yellow : 'without a proxy'.bold.yellow;
  console.log(`Starting initial check-in ${proxyStatus}...`.bold.yellow);
  await initiateCheckIn(proxyEnabled);

  const checkInInterval = 12 * 60 * 60 * 1000;
  const hoursInterval = checkInInterval / (60 * 60 * 1000);

  setInterval(() => {
    console.log(
      `\nProcessing check-in at ${new Date().toLocaleString()}\n`.green
    );
    initiateCheckIn(proxyEnabled);
  }, checkInInterval);

  console.log(`Reinitiating the process in ${hoursInterval} hours...`.green);
})();

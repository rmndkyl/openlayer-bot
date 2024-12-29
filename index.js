require('colors');
const readlineSync = require('readline-sync');
const axios = require('axios');
const moment = require('moment');
const configuration = require('./config');
const { HttpsProxyAgent } = require('https-proxy-agent');
const gradient = require('gradient-string');
const figlet = require('figlet');
const ora = require('ora');

const API_URL = 'https://us-central1-openoracle-de73b.cloudfunctions.net';
const CHECK_IN_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

async function displayHeader() {
    return new Promise((resolve) => {
        figlet('Layer Airdrop', {
            font: 'ANSI Shadow',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        }, (err, data) => {
            if (err) {
                console.log('Something went wrong with the banner...');
                resolve();
                return;
            }
            console.log(gradient.rainbow(data));
            console.log(gradient.pastel('\n=== OpenLayer Check-in Bot v2.0 ===\n'));
            console.log(gradient.cristal('Created by @rmndkyl\n'));
            resolve();
        });
    });
}

async function retrieveUserInfo(token) {
    const spinner = ora('Retrieving user information...').start();
    
    try {
        const { data } = await axios({
            url: `${API_URL}/backend_apis/api/service/userInfo`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        spinner.succeed('User information retrieved successfully');
        return data.data;
    } catch (error) {
        spinner.fail('Failed to retrieve user information');
        throw error;
    }
}

function displayUserStats(userData, proxyAddress) {
    const paddingLength = 120; // Increased to accommodate longer proxy URLs
    const statsBox = [
        '\n═' + '═'.repeat(paddingLength) + '═'.cyan,
        `🟢`.cyan + ` Username:`.padEnd(15) + userData.xUsername.bold.yellow.padEnd(paddingLength - 55) + ''.cyan,
        `🟢`.cyan + ` Egg:`.padEnd(15) + `${userData.eggInfo.eggInfo.name} ${userData.eggInfo.eggInfo.type}`.padEnd(paddingLength - 55) + ''.cyan,
        `🟢`.cyan + ` Multiplier:`.padEnd(15) + `${userData.point.multiplier}x`.bold.yellow.padEnd(paddingLength - 55) + ''.cyan,
        `🟢`.cyan + ` Checkins:`.padEnd(15) + userData.point.consecutiveCheckinCount.toString().bold.yellow.padEnd(paddingLength - 55) + ''.cyan,
        `🟢`.cyan + ` Points:`.padEnd(15) + userData.point.currentPoints.toString().bold.green.padEnd(paddingLength - 55) + ''.cyan,
    ];

    if (proxyAddress) {
        statsBox.push(`🟢`.cyan + ` Proxy:`.padEnd(15) + proxyAddress.cyan.padEnd(paddingLength - 17) + ''.cyan);
    }
    
    statsBox.push('═' + '═'.repeat(paddingLength) + '═'.cyan);
    console.log(statsBox.join('\n'));
}

async function authenticateUser(token, proxyAddress = null) {
    const spinner = ora('Authenticating...').start();
    
    try {
        const requestConfig = {
            url: `${API_URL}/backend_apis/api/service/checkIn`,
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
        spinner.succeed('Authentication successful');
        return data;
    } catch (error) {
        spinner.fail('Authentication failed');
        throw error;
    }
}

async function initiateCheckIn(proxyEnabled) {
    for (let i = 0; i < configuration.length; i++) {
        console.log(`\n${gradient.rainbow(`≡≡≡≡≡≡≡≡≡≡≡≡≡ Account ${i + 1} ≡≡≡≡≡≡≡≡≡≡≡≡≡`)}\n`);

        try {
            const token = configuration[i].token;
            const proxyAddress = proxyEnabled ? configuration[i].proxy : null;
            
            const userData = await retrieveUserInfo(token);
            displayUserStats(userData, proxyAddress);
            
            const response = await authenticateUser(token, proxyAddress);
            
            if (response.msg.includes('already checked in')) {
                logCheckInStatus('Already checked in for today', 'red');
            } else {
                logCheckInStatus('Check-in completed successfully!', 'green');
            }
        } catch (error) {
            logError(error);
            continue;
        }
    }
}

function logCheckInStatus(message, color) {
    const timestamp = moment().format('HH:mm:ss');
    const statusIcon = color === 'green' ? '✓'.green : '✗'.red;
    console.log(`\n[${timestamp}] ${statusIcon} ${message[color]}`);
}

function logError(error) {
    const timestamp = moment().format('HH:mm:ss');
    console.log(`\n[${timestamp}] ⚠️  Error: ${error.message}`.red);
}

async function startBot() {
    await displayHeader();

    const proxyChoice = readlineSync.keyInYNStrict(
        gradient.cristal('Do you want to use proxies?')
    );

    const proxyStatus = proxyChoice ? 'with proxy'.yellow : 'without proxy'.yellow;
    console.log(`\n${gradient.pastel('Starting check-in process')} ${proxyStatus}...\n`);
    
    await initiateCheckIn(proxyChoice);

    const hoursInterval = CHECK_IN_INTERVAL / (60 * 60 * 1000);
    console.log(`\n${gradient.cristal('Bot will check in again after')} ${hoursInterval} ${gradient.cristal('hours')}`);
    
    setInterval(async () => {
        console.log(gradient.rainbow('\n=== New Check-in Cycle Started ===\n'));
        console.log(`Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`);
        await initiateCheckIn(proxyChoice);
    }, CHECK_IN_INTERVAL);
}

startBot().catch(console.error);

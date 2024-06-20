require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const STOCK_SYMBOL = process.env.STOCK_SYMBOL;
const API_KEY = process.env.API_KEY;
const API_URL = `https://api.genericstockprovider.com/quote?symbol=${STOCK_SYMBOL}&apikey=${API_KEY}`;
const INTERVAL = 30000;

async function fetchStockPrice() {
    try {
        const response = await axios.get(API_URL);
        const stockPrice = response.data.price;
        return stockPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}

async function updateBotStatus() {
    const stockPrice = await fetchStockPrice();
    if (stockPrice) {
        await client.user.setPresence({
            status: 'online',
            activities: [{
                name: `GME: $${stockPrice}`,
                type: 'WATCHING',
            }],
        });
        const guilds = client.guilds.cache.map(guild => guild);
        for (const guild of guilds) {
            await guild.me.setNickname(`GME: $${stockPrice}`);
        }
        console.log(`Updated status and nickname to GME: $${stockPrice}`);
    }
}

client.once('ready', () => {
    console.log('Bot is online!');
    updateBotStatus();
    setInterval(updateBotStatus, INTERVAL);
});

client.login(DISCORD_TOKEN);

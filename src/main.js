'use strict';

/* eslint-disable no-console */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 340,
    height: 380,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('https://pokeclicker-dev.github.io/pokeclicker/');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Set this to your Client ID.
const clientId = '733927271726841887';

// Only needed if you want to use spectate, join, or ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !mainWindow) {
    return;
  }

  const caught = await mainWindow.webContents.executeJavaScript('App.game.party.caughtPokemon.length');
  const shiny = await mainWindow.webContents.executeJavaScript('App.game.party.shinyPokemon.length');

  // You'll need to have snek_large and snek_small assets uploaded to
  // https://discord.com/developers/applications/<application_id>/rich-presence/assets
  rpc.setActivity({
    state: 'Hunting Shinies',
    details: `${shiny}/${caught} ✨`,
    // largeImageKey: 'snek_large',
    // largeImageText: 'tea is delicious',
    // smallImageKey: 'snek_small',
    // smallImageText: 'i am my own pillows',
    instance: false,
  });
}

rpc.on('ready', () => {
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login({ clientId }).catch(console.error);

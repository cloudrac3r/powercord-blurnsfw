const { Plugin } = require('powercord/entities');
const webpack = require('powercord/webpack');
const { getModuleByDisplayName } = webpack;
const { inject, uninject } = require('powercord/injector');
const { getOwnerInstance } = require('powercord/util');
const { resolve } = require('path');

module.exports = class BlurNSFW extends Plugin {
  async startPlugin() {
    this.loadStylesheet(resolve(__dirname, 'style.scss'));
    this.getChannel = (await webpack.getModule(['getChannel'])).getChannel;
    this.patchedRenderer = false;
    this._patchChannelList();
  }

  pluginWillUnload() {
    uninject('cadence-blurnsfw-channels');
  }

  async _patchChannelList() {
    const _this = this;
    const chatClass = (await webpack.getModule(['chat'], false)).chat;
    const ChannelItem = await getModuleByDisplayName('ChannelItem');
    const chat = document.querySelector(`.${chatClass}`);
    _this._patchChannelRenderer(chat);
  }

  async _patchChannelRenderer(chat) {
    const _this = this;
    const Channel = getOwnerInstance(chat);
    inject('cadence-blurnsfw-channels', Channel.constructor.prototype, 'render', (_, res) => {
      const currentChannelID = res.props.children[1].props.channelId;
      const channel = _this.getChannel(currentChannelID);

      if (channel.nsfw) {
        res.props.className += ' nsfw';
      }

      return res;
    });
  }
};

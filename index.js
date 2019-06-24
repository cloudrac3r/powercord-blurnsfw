const { Plugin } = require("powercord/entities")
const webpack = require("powercord/webpack")
const { getModuleByDisplayName } = webpack
const { inject, uninject } = require("powercord/injector")
const { getOwnerInstance } = require("powercord/util")
const { resolve} = require("path")

module.exports = class BlurNSFW extends Plugin {
	constructor () {
		super()
	}

	async startPlugin () {
		this.loadCSS(resolve(__dirname, "style.scss"))
		this.getChannel = (await webpack.getModule(["getChannel"])).getChannel
		this.patchedRenderer = false
		this._patchChannelList()
	}

	pluginWillUnload () {
		uninject("cadence-blurnsfw-channels")
		uninject("cadence-blurnsfw-channellist")
	}

	async _patchChannelList() {
		let _this = this;
		const Channels = await getModuleByDisplayName("Channels")
		inject("cadence-blurnsfw-channellist", Channels.prototype, "render", function(_, res) {
			let chat = document.querySelector(".pc-chat")
			if (chat && !_this.patchedRenderer) {
				_this._patchChannelRenderer(chat)
				_this.patchedRenderer = true
				uninject("cadence-blurnsfw-channellist")
			}
			return res
		})
	}

	async _patchChannelRenderer(chat) {
		let _this = this
		const Channel = getOwnerInstance(chat)
		inject("cadence-blurnsfw-channels", Channel.constructor.prototype, "render", function(_, res) {
			let currentChannelID = res.props.children[1].props.channelId
			let channel = _this.getChannel(currentChannelID)
			if (channel.nsfw) {
				res.props.className += " is-nsfw-channel"
			}
			return res
		})
	}
}
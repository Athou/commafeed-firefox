var CommaFeed = {

	installButton : function(toolbarId, id) {
		if (!document.getElementById(id)) {
			var toolbar = document.getElementById(toolbarId);
			toolbar.insertItem(id);
			toolbar.setAttribute("currentset", toolbar.currentSet);
			document.persist(toolbar.id, "currentset");
			if (toolbarId == "addon-bar")
				toolbar.collapsed = false;
		}
	},
	
	getUrl : function() {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
		return prefs.getCharPref('extensions.commafeed.url');
	},
	
	show_status : function(display_text) {
		var btn = document.getElementById("toolbar_button");
		var canvas = document.getElementById("toolbar_button_canvas");
		
		// get image path
		var img_src = window.getComputedStyle(btn).listStyleImage.replace(/^url\("(chrome:\/\/commafeed\/skin\/icon_0\d{2}.png)"\)$/,
				"$1"); 
				
		// get image size
		var csize = img_src.replace(/^chrome:\/\/commafeed\/skin\/icon_0(\d{2})\.png$/, "$1"); 

		canvas.setAttribute("width", csize);
		canvas.setAttribute("height", csize);
		var ctx = canvas.getContext("2d");

		var img = new Image();
		img.onload = function() {
			ctx.textBaseline = "top";
			ctx.font = "bold 9px sans-serif"; // has to go before measureText

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);

			if (display_text !== "") {
				var w = ctx.measureText(display_text).width;
				var h = 7; // 9 = font height

				var rp = ((canvas.width - 4) > w) ? 2 : 1; // right padding =
															// 2, or 1 if text
															// is wider
				var x = canvas.width - w - rp;
				var y = canvas.height - h - 1; // 1 = bottom padding

				ctx.fillStyle = "#f00"; // background color
				ctx.fillRect(x - rp, y - 1, w + rp + rp, h + 2);
				ctx.fillStyle = "#fff"; // text color
				ctx.fillText(display_text, x, y);
				// ctx.strokeText(display_text, x, y);
			}
			btn.image = canvas.toDataURL("image/png", "");
		};
		img.src = img_src;
	},

	refresh: function() {
		var that = this;
		var url = that.getUrl();
		
		if (url.lastIndexOf('/') != url.length - 1) {
			url += '/';
		}
		var xhr = new XMLHttpRequest();
		try {
			xhr.channel.QueryInterface(Ci.nsIHttpChannelInternal).
			forceAllowThirdPartyCookie = true;
		}
		catch(ex) { /* user is using Firefox 3.5 */ }
		xhr.open("GET", url + "rest/category/unreadCount", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var resp = JSON.parse(xhr.responseText);
				var count = 0;
				for ( var i = 0; i < resp.length; i++) {
					count += resp[i].unreadCount;
				}
				if (count === 0)
					count = '';
				that.show_status('' + count);
			} else {
				that.show_status('?');
			}
		}
		xhr.send();
		setTimeout(function() {  that.refresh() }, 60000);
	},

	onLoad : function() {
		this.installButton("nav-bar", "toolbar_button");
		this.refresh();
		this.initialized = true;
	},

	onMenuItemCommand : function() {
		var url = this.getUrl();
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator)
				.getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab(url);
	}
};

window.addEventListener("load", function(e) {
	CommaFeed.onLoad(e);
}, false);

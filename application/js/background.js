'use strict';

var server = new Server();
server.init();

function Server() {
	
	function changeChromeBadgeText(text) {
		if (text) {
			chrome.browserAction.setBadgeBackgroundColor({color: [200, 100, 100, 200]});
		} else {
			chrome.browserAction.setBadgeBackgroundColor({color: [100, 220, 100, 200]});
		}
		chrome.browserAction.setBadgeText({text: '' + text});
	}
	
	
    this.refreshInterval = null;

    this.state = {
        elems: null,
        addElem: function (e) {
			var newMessage = 0;
			
            if (this.elems.hasOwnProperty(e.text)) {
                var existing = this.elems[e.text];
                ++existing.timesLoaded;
                existing.lastLoaded = new Date();
            } else {
                e.dateRegistered = new Date();
                e.timesLoaded = 0;
                this.elems[e.text] = e;
				newMessage = 1;
            }			
			
			return newMessage;
        }
    };

    this.request = function () {
        console.log('Rent topics requested. ' + new Date());
		
        var xhr = new XMLHttpRequest(),
            self = this,
            callback = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log('Rent topics received. ' + new Date());
                    var body = self.util.stripDom(xhr.responseText),
						newElemsCount = 0;

                    $(body).find('td[title][id]:contains("Сдам")').each(function (i, el) {
                        var e = $(el);
                        newElemsCount += self.state.addElem({
								text: e.text().replace(/\s+/, ' '),
								title: e.attr('title'),
								link: e.find('a[href*="showthread"]').attr('href')
							});
                    });
					
					changeChromeBadgeText(newElemsCount);			
                }
            };

        xhr.open("GET", "http://www.kharkovforum.com/forumdisplay.php?f=112", true);
        xhr.onreadystatechange = callback;
        xhr.send();
    };

    this.util = {
        stripDom: function (text) {
            text = text.substring(text.indexOf('<body>'), text.indexOf('</body>') + 7);
            return text;
        }
    };

    this.init = function () {
        this.state.elems = {}; //TODO: localStorage
        this.request();
        var self = this;
        this.refreshInterval = setInterval(function () {
            self.request();
        }, 1000*60*5); //5 min
    };

}

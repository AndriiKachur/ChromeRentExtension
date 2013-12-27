var server = new Server();
server.init();

function Server() {
    this.refreshInterval = null,

    this.state = {
        elems: null,
        addElem: function (e) {
            if (this.elems.hasOwnProperty(e.text)) {
                var existing = this.elems[e.text];
                ++existing.timesLoaded;
                existing.lastLoaded = new Date();
            } else {
                e.dateRegistered = new Date();
                e.timesLoaded = 0;
                this.elems[e.text] = e;
            }
        }
    };

    this.request = function () {
        console.log('Rent topics requested. ' + new Date());
        var xhr = new XMLHttpRequest(),
            self = this,
            callback = function () {
                if (xhr.readyState == 4) {
                    console.log('Rent topics received. ' + new Date());
                    var body = self.util.stripDom(xhr.responseText);

                    $(body).find('td[title][id]:contains("Сдам")').each(function (i, el) {
                        var e = $(el);
                        self.state.addElem({
                            text: e.text().replace(/\s+/, ' '),
                            title: e.attr('title'),
                            link: e.find('a[href*="showthread"]').attr('href')
                        });
                    });
                }
            };

        xhr.open("GET", "http://www.kharkovforum.com/forumdisplay.php?f=112", true);
        xhr.onreadystatechange = callback;
        xhr.send();
    },

    this.util = {
        stripDom: function (text) {
            text = text.substring(text.indexOf('<body>'), text.indexOf('</body>') + 7);
            return text;
        }
    },

    this.init = function () {
        this.state.elems = {}; //TODO: localStorage
        this.request();
        var self = this;
        this.refreshInterval = setInterval(function () {
            self.request();
        }, 300000); //5 min
    }
};
'use strict';

(function(chrome, angular) {

    var background = chrome.extension.getBackgroundPage(),
        ngApp = angular.module('app', []);
    chrome.browserAction.setBadgeBackgroundColor({color: [200, 100, 100, 200]});

    ngApp.controller('MainCtrl', function ($scope, $timeout, $filter, $log) {

        $scope.isNew = function(e) {
            return !e.lastOpened && e.lastLoaded;
        };
        $scope.isNewest = function(e) {
            return !e.lastOpened  && !e.lastLoaded;
        };

        $scope.date = function(date) {
            return $filter('date')(date, 'dd MMM yy hh:mm');
        };

        $scope.goTo = function (elem) {
            var props = {
                    url: 'http://www.kharkovforum.com/' + elem.link,
                    active: true
                },
                callback = function (tab) {
                    $log.info('Link followed: ' + props.url);
                    elem.lastOpened = new Date();
                    fillElems();
                };
            chrome.tabs.create(props, callback);
        };

        var fillElems = function() {
            var elems = background.server.state.elems;

            $scope.elems = [];
            for (var i in elems) {
                $scope.elems.push(elems[i]);
            }

            chrome.browserAction.setBadgeText({
                text: '' + Object.values(elems).filter($scope.isNewest).length
            });
        };
        fillElems();
        $timeout(fillElems, 5000);

    });

})(chrome, angular);


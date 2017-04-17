var Main = (function () {

    var _serverSets = {};
    _serverSets.du = [{
        name: 'Web 1',
        alias: '70',
        baseUrl: 'http://10.100.188.70'
    }, {
        name: 'Web 2',
        alias: '71',
        baseUrl: 'http://10.100.188.71'
    }, {
        name: 'Web 3',
        alias: '72',
        baseUrl: 'http://10.100.188.72'
    }, {
        name: 'Web 4',
        alias: '73',
        baseUrl: 'http://10.100.188.73'
    }, {
        name: 'Web 5',
        alias: '74',
        baseUrl: 'http://10.100.188.74'
    }, {
        name: 'Web 6',
        alias: '75',
        baseUrl: 'http://10.100.188.75'
    }, {
        name: 'Web 7',
        alias: '76',
        baseUrl: 'http://10.100.188.76'
    }, {
        name: 'Web 8',
        alias: '77',
        baseUrl: 'http://10.100.188.77'
    }, {
        name: 'CPS',
        alias: 'CPS',
        baseUrl: 'http://10.100.167.197'
    }];

    _serverSets.dev = [{
        name: 'DNS Not Resolved',
        alias: 'Error',
        baseUrl: 'http://www.zxcvawef.com'
    }, {
        name: 'Bing',
        alias: 'Bing',
        baseUrl: 'http://www.bing.com'
    }, {
        name: 'Wikipedia',
        alias: 'Wikipedia',
        baseUrl: 'http://www.wikipedia.org'
    }, {
        name: 'Status',
        alias: 'The Status',
        baseUrl: 'http://localhost:3000/status.html'
    }];

    var _servers = _serverSets.du;

    var _serverStatusContainerViews = ['list', 'grid2', 'sideBySidePartial', 'sideBySideFull'];

    var init = function () {
        initializeControls();
        initializeServersFilter();
        //executeSettings();
    };

    var initializeControls = function () {

        svg4everybody();

        $('.settings').on('submit', function (e) {
            executeSettings();

            e.preventDefault();
            return false;
        });

        $('.serverExplorer-showSettingsButton').on('click', function () {
            $(this).hide();
            $('.serverExplorer-hideSettingsButton').show();
            $('.settings').show();
        });

        $('.serverExplorer-hideSettingsButton').on('click', function () {
            $(this).hide();
            $('.serverExplorer-showSettingsButton').show();
            $('.settings').hide();
        });

        $('.serverStatus-container').on('click', '.serverStatus-header', function (e) {
            if (e.target && $.trim(e.target.nodeName).toLowerCase() == 'a') {
                return;
            }

            $(this).closest('.serverStatus-item').toggleClass('open');
        });

        $('.serverStatus-container').on('click', '.serverStatus-refreshButton', function () {

            var refreshButton = $(this);
            var serverStatusItem = refreshButton.closest('.serverStatus-item');
            var serverStatusContent = serverStatusItem.find('.serverStatus-content');

            refreshServerStatusContent(serverStatusContent);

        });

        $('.serverExplorer-changeViewButton').on('click', function () {
            var serverStatusContainer = $('.serverStatus-container');
            var currentView = serverStatusContainer.attr('data-view');
            var viewIndex = _serverStatusContainerViews.indexOf(currentView);
            var newIndex = viewIndex + 1;
            if (newIndex > _serverStatusContainerViews.length - 1) {
                newIndex = 0;
            }
            var newView = _serverStatusContainerViews[newIndex];

            serverStatusContainer.attr('data-view', newView);
        });

        $('.serverExplorer-expandAllButton').on('click', function () {
            $('.serverStatus-container .serverStatus-item').addClass('open');
        });

        $('.serverExplorer-collapseAllButton').on('click', function () {
            $('.serverStatus-container .serverStatus-item').removeClass('open');
        });

        window.addEventListener('message', function (e) {
            console.log('message received. data: ' + JSON.stringify(e.data || {}));

            if (e.data && e.data.serverExplorerKey) {
                $('.serverStatus-item[data-serverExplorerKey="' + e.data.serverExplorerKey + '"]').addClass('loaded');
            }
        }, false);

    };

    var initializeServersFilter = function () {

        var serverFilterItemTemplate = $('#ServerFilterItemTemplate').html();
        var serversFilter = $('.settings-servers');

        _servers.forEach(function (item) {
            var serverItem = $(serverFilterItemTemplate);
            var checkbox = serverItem.find('input');
            checkbox.attr('data-name', item.name);
            checkbox.attr('data-alias', item.alias);
            checkbox.attr('data-baseUrl', item.baseUrl);
            checkbox.attr('value', item.baseUrl);
            serverItem.find('.text').text(item.name + ' (' + item.alias + ')');

            serversFilter.append(serverItem);
        });

    }

    var executeSettings = function () {

        var selectedServers = [];
        $('input[name="Server"]:checked').each(function () {
            var element = $(this);

            selectedServers.push({
                name: element.attr('data-name'),
                alias: element.attr('data-alias'),
                baseUrl: element.attr('data-baseUrl')
            });
        });

        var urlPath = $.trim($('input[name="UrlPath"]').val());
        if (urlPath == '/') {
            urlPath = '';
        } else if (urlPath.length > 0 && !urlPath.startsWith('/')) {
            urlPath = urlPath.substring(1);
        }

        var serverResultItemTemplate = $('#ServerResultItemTemplate').html();
        var serverItems = [];
        selectedServers.forEach(function (server) {

            var baseUrl = $.trim(server.baseUrl);
            if (baseUrl.length > 0 && baseUrl.endsWith('/')) {
                baseUrl = baseUrl.substring(0, baseUrl.length - 2);
            }

            var serverItemHtml = serverResultItemTemplate;
            serverItemHtml = serverItemHtml.replace(/\{name}/g, server.name);
            serverItemHtml = serverItemHtml.replace(/\{alias}/g, server.alias);
            serverItemHtml = serverItemHtml.replace(/\{url}/g, baseUrl + urlPath);

            serverItems.push(serverItemHtml);
        });

        var serverStatusContainer = $('.serverStatus-container');
        serverStatusContainer.empty();
        serverStatusContainer.append(serverItems.join(''));

        serverStatusContainer.find('.serverStatus-content').each(function () {
            refreshServerStatusContent(this);
        });
    }

    var refreshServerStatusContent = function (contentElement) {
        var serverStatusContent = $(contentElement);
        var serverStatusItem = serverStatusContent.closest('.serverStatus-item');
        var url = serverStatusContent.attr('data-url');
        var serverExplorerKey = Math.floor(Math.random() * 100000000);
        var title = 'Frame #' + serverExplorerKey;

        serverStatusItem.attr('data-serverExplorerKey', serverExplorerKey);
        serverStatusItem.removeClass('loaded');
        
        var iframeHtml = $('#ServerStatusContentIframeTemplate').html();
        iframeHtml = iframeHtml.replace(/\{name}/g, title);
        
        var iframe = $(iframeHtml);
        serverStatusContent.empty();
        serverStatusContent.append(iframe);

        iframe.on('load', function (e) {
            var target = e.target;
            var src = target.src;

            console.log('iframe "' + src + '" has finished loading');

        });

        iframe.attr('src', url);
    };

    var getUriParameters = function (url) {

        var parameters = {};
        var search = decodeURI(document.location.search);
        var pattern = /[&?]([^=^&^#]+)=([^&^#]+)/g;
        var match = null;

        if ($.trim(url).length > 0) {
            var link = $('<a href="' + url + '">link</a>');
            search = link.search;
        }

        while (match = pattern.exec(search)) {
            var parameter = match[1];
            var value = match[2];

            parameters[parameter] = decodeURIComponent(value.replace(/\+/g, ' '));
        }

        return parameters;
    };

    return {
        init: init
    };
})();

document.addEventListener("DOMContentLoaded", function (event) {
    Main.init();
});
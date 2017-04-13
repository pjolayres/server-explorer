var Main = (function () {

    var _serverSets = {};
    _serverSets.du = [{
            name: 'CPS',
            alias: 'CPS',
            baseUrl: 'http://10.100.167.197'
        },
        {
            name: 'Web 1',
            alias: '70',
            baseUrl: 'http://10.100.188.70'
        },
        {
            name: 'Web 2',
            alias: '71',
            baseUrl: 'http://10.100.188.71'
        },
        {
            name: 'Web 3',
            alias: '72',
            baseUrl: 'http://10.100.188.72'
        },
        {
            name: 'Web 4',
            alias: '73',
            baseUrl: 'http://10.100.188.73'
        },
        {
            name: 'Web 5',
            alias: '74',
            baseUrl: 'http://10.100.188.74'
        },
        {
            name: 'Web 6',
            alias: '75',
            baseUrl: 'http://10.100.188.75'
        },
        {
            name: 'Web 7',
            alias: '76',
            baseUrl: 'http://10.100.188.76'
        },
        {
            name: 'Web 8',
            alias: '77',
            baseUrl: 'http://10.100.188.77'
        },
    ];
    
    var _servers = _serverSets.du;

    var init = function () {
        initializeControls();
        initializeServersFilter();
        executeSettings();
    };

    var initializeControls = function () {

        svg4everybody();

        $('.settings-form').on('submit', function () {
            executeSettings();

            e.preventDefault();
            return false;
        });

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

        var urlPath = $.trim($('input[name="Urlpath"]').val());
        if (urlPath.length <= 0) {
            urlPath = '/';
        }

        var serverResultItemTemplate = $('#ServerResultItemTemplate').html();
        var serverItems = [];
        selectedServers.forEach(function (server) {

            var serverItemHtml = serverResultItemTemplate;
            serverItemHtml = serverItemHtml.replace(/\{name}/g, server.name);
            serverItemHtml = serverItemHtml.replace(/\{alias}/g, server.alias);
            serverItemHtml = serverItemHtml.replace(/\{url}/g, server.baseUrl + urlPath);

            serverItems.push(serverItemHtml);
        });

        var serverStatusContainer = $('.serverStatus-container');
        serverStatusContainer.append(serverItems.join(''));

    }

    return {
        init: init
    };
})();

document.addEventListener("DOMContentLoaded", function (event) {
    Main.init();
});
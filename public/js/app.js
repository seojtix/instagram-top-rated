$(document).ready(function() {
    
    i18next
        .use(i18nextBrowserLanguageDetector)
        .use(i18nextXHRBackend)
        .init({
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],

            lookupQuerystring: 'lang',
            lookupCookie: 'lang',
            lookupLocalStorage: 'lang',

            caches: ['localStorage', 'cookie'],

            cookieMinutes: 10,
            cookieDomain: 'homestead.app'
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            addPath: '#',
            allowMultiLoading: false
        },
        fallbackLng: 'en'
    }, function(err, t) {
        Handlebars.registerHelper('i18n', function (context, options) {
            var opts = $.extend(options.hash, context);
            if (options.fn) opts.defaultValue = options.fn(context);
            var result = i18next.t(opts.key, opts);
            return new Handlebars.SafeString(result);
        });

        InitializeApp();
    });
});

function InitializeApp() {
    var source = $('#template').html();
    var template = Handlebars.compile(source);
    var body_source = $('#template-body').html();
    var body_template = Handlebars.compile(body_source);

    var body_rendered = body_template({});
    $('#body').html(body_rendered);

    window.LAST_USERID = 0;
    window.LAST_TEMPLATE = template;
    window.LAST_BODY_TEMPLATE = body_template;
    window.LAST_FEED = null;

    // seojtix, panovaia, alex_malyshev_
    $(document).on('click', '#submit_search', function() {
        $('#loading').fadeIn();
        $('#instafeed').hide();
        $('#search-block').hide();
        
        InstaAPI.getUserId($('#instagram_username').val(), function (userId) {
            window.LAST_USERID = userId;
            window.LAST_FEED = null;

            updateFeed(userId, 'most-liked', template);
        });
    });

    $(document).on('click', '#change_language', function() {
        var lang = 'en';
        if (i18next.language == 'en') lang = 'ru';

        i18next.changeLanguage(lang, function (err, t) {
            var body_template = window.LAST_BODY_TEMPLATE;
            var body_rendered = body_template({});
            $('#body').html(body_rendered);
        });
    });
}

function updateFeed(userId, sortParam, template) {
    if (window.LAST_FEED == null) {
        InstaAPI.getFeed(userId, function (data) {
            window.LAST_FEED = data;
            data = sortData(data, sortParam);
            var rendered = template(data);
            $('#instafeed').html(rendered);
            $('#instafeed').fadeIn();
            $('#search-block').fadeIn();
            $('#loading').hide();
        });
    } else {
        var data = sortData(window.LAST_FEED, sortParam);
        var rendered = template(data);
        $('#instafeed').html(rendered);
        $('#instafeed').fadeIn();
        $('#search-block').fadeIn();
        $('#loading').hide();
    }
}

function setType(type) {
    updateFeed(window.LAST_USERID, 'most-' + type, window.LAST_TEMPLATE);

    return false;
}

function sortData(data, sortParam) {
    if (sortParam == 'most-recent') {
        data.data = _.sortBy(data.data, function (item) {
            return item.created_time;
        });
    } else if (sortParam == 'most-liked') {
        data.data = _.sortBy(data.data, function (item) {
            return item.likes.count;
        });
    } else if (sortParam == 'most-commented') {
        data.data = _.sortBy(data.data, function (item) {
            return item.comments.count;
        });
    }

    data.data = data.data.reverse();

    return data;
}
!function ($) {

    $(function(){
        refreshTime();
        setInterval( function() {
            refreshTime();
        }, 59000);

        refreshContent();

        setInterval( function() {
            refreshContent();
        }, 60000);

        loadWeather();

        setInterval( function() {
            loadWeather();
        }, 900000);

        l2status();

        setInterval( function() {
            l2status();
        }, 60000);

        l2events();

        setInterval( function() {
            l2events();
        }, 3600000);

        wortLuNews();

        setInterval( function() {
            wortLuNews();
        }, 900000);

    });



}(window.jQuery);

function refreshTime() {

    $('.time').text( moment().format('HH:mm') );
    $('.date').text( moment().format('dddd, Do \of MMMM') );

}

function refreshContent() {

    $('#wrapper').html('');

    var request = $.ajax({
      type: 'get',
      url: 'http://getcontents.herokuapp.com/?url=http%3A%2F%2Ftravelplanner.mobiliteit.lu%2Fhafas%2Fcdt%2Fstboard.exe%2Ffn%3FL%3Dvs_stb%26input%3D200404028%26boardType%3Ddep%26time%3D' + moment().format('HH') + '%3A' + moment().format('mm') + '%26selectDate%3Dtoday%26start%3Dyes%26requestType%3D0%26maxJourneys%3D10',
      complete: function( response ) {

        resp = response.responseText.slice(14);

        data =  JSON.parse( resp );

        busses = data.journey;

        var content = '';

        $.each(busses, function(nr, bus) {

            var name        = bus.pr;
            var destination = bus.st;

            if ( bus.rt != false ) {

                var time = bus.rt.dlt;

            } else {

                var time = bus.ti;

            }

            var timeDifference;

            var busTime = moment()
                .set('hour', time.substring(0, 2) )
                .set('minute', time.substring(3, 5) );

            timeDifference = busTime.diff( moment(), 'minutes' );

            timeLeftMessage = 'departure in ' + timeDifference + ' minutes';

            if ( timeDifference <= 5 && timeDifference > -1 ) {

                labelColor = "danger";

            } else if ( timeDifference <= 10 && timeDifference > -1 ) {

                labelColor = "warning";

            } else {

                labelColor = "info";
                timeLeftMessage = '';

            }

            if ( name.indexOf("Bus") != -1 ) {
                name = name.slice( name.indexOf("Bus ") + 4 );
            }

            content += '<h1>' + time + ' <span class="label label-' + labelColor + ' label-lg">' + name + '</span> ' + destination + '</h1>' + timeLeftMessage;


        });

        $('.busses').html('');
        $('.busses').append( content );



        console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated busses' );

      }
    });

}

function loadWeather() {

    var city = 'Bonnevoie';
    var country = 'lu';
    var appid = '64a2215ad2f5f944abd334578763726e';

    var request = $.ajax({
        type: 'get',
        url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=' + city + ',' + country + '&appid=' + appid,
        complete: function( response ) {

            data =  JSON.parse( response.responseText );

            weather = data.weather[0];

            var description     = weather.description;
            var weatherId       = weather.icon;
            var temperature     = formatTemp( data.main.temp );

            $('.currentTemp').text( temperature );
            $('.weatherIcon').attr( 'class', 'climacon ' + OWMIcon( weatherId ) );

            console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated weather' );

        }
    });

}

function formatTemp( temperature ) {

  temperature = ( temperature ).toFixed(1);

  if (temperature > 10 ) {

    temperature = Math.round( temperature );

  }

  return temperature + '°';

}

function OWMIcon( imageCode ) {
// Icon Name & Colour Percentage
  var b = {
    '01d': [ "sun" ],
    '01n': [ "moon" ],

    '02d': [ "cloud sun" ],
    '02n': [ "cloud moon" ],

    '03d': [ "cloud" ],
    '03n': [ "cloud" ],

    '04d': [ "cloud" ],
    '04n': [ "cloud" ],

    '09d': [ "showers sun" ],
    '09n': [ "showers moon" ],

    '10d': [ "rain sun" ],
    '10n': [ "rain moon" ],

    '11d': [ "lightning sun" ],
    '11n': [ "lightning moon" ],

    '13d': [ "snow sun" ],
    '13n': [ "snow moon" ],

    '50d': [ "fog sun" ],
    '50n': [ "fog moon" ]
  };
  return b[ imageCode ]
}

function l2status() {

    var request = $.ajax({
        type: 'get',
        url: 'https://www.hackerspace.lu/od/',
        complete: function( response ) {

            var status =  JSON.parse( response.responseText );

            $('.status').removeClass('open').removeClass('closed');

            if ( status.open ) {
                $('.status').addClass('open').text('Open');
            } else {
                $('.status').addClass('closed').text('Closed');
            }

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated Level2 status' );

}

function l2events() {

    var request = $.ajax({
        type: 'get',
        url: 'http://getcontents.herokuapp.com/?url=https%3A%2F%2Fwiki.hackerspace.lu%2Fwiki%2FSpecial%3AAsk%2F-5B-5BCategory%3AEvent-5D-5D-20-5B-5BStartDate%3A%3A-3E' + moment().format('YYYY') + '-2D' + moment().format('MM') + '-2D' + moment().format('DD') + '-5D-5D-20-3Cq-3E-5B-5BHas-20organizer%3A%3AOrganisation%3ASyn2cat-5D-5D-20OR-20-5B-5BIs-20External%3A%3Ano-5D-5D-3C-2Fq-3E-20-5B-5BDo-20Announce%3A%3Ayes-5D-5D%2F-3FStartDate%2F-3FEndDate%2F-3FHas-20subtitle%2F-3FHas-20description%2F-3FIs-20Event-20of-20Type%253DIs-20type%2F-3FHas-20location%2F-3FHas-20picture%2F-3FHas-20cost%2F-3FCategory%2Fformat%253Djson%2Fsort%253DStartDate%2Forder%253Dascending%2Fsearchlabel%253DJSON-20(Internal%2C-20announceable-20events-20only%2C-20only-20upcoming-20events)',
        complete: function( response ) {

            var events =  JSON.parse( response.responseText );

            var output = '';

            $.each( events.items , function( nr, l2event ) {

                output += '<div class="panel">'
                + '<h1>' + l2event.label + ' <small>'
                + moment( l2event.startdate, "YYYY-MM-DD HH:mm:ss").format( 'dddd, Do \of MMMM' )
                + '</small></h1>'
                + l2event.has_subtitle
                + '</div>';

            });

            $('.events').html('').append( output );

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated Level2 events' );

}

function wortLuNews() {

    var request = $.ajax({
        type: 'get',
        url: 'http://device.wort.lu/api/v303/sites/en/sections/4f4e59a1e4b056b73debc870',
        complete: function( response ) {

            var articles =  response.responseJSON.articles;

            console.log( articles )

            var output = '';

            for ( var ArticleNR = 0; ArticleNR < 5; ArticleNR++ ) {

                var article = articles[ ArticleNR ];

                output += '<div class="panel">'
                + '<h1>' + article.title + '</h1>'
                + article.teaser
                + '</div>';

            }

            $('.news').html('').append( output );

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated WortLu News' );

}

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

        cflNews();

        setInterval( function() {
            cflNews();
        }, 900000);

    });



}(window.jQuery);

function refreshTime() {

    $('.time').text( moment().format('HH:mm') ); // 03:37
    $('.date').text( moment().format('dddd, D MMMM') );  // Sunday, 31 August

}

function refreshContent() {

    $('#wrapper').html('');

    var request = $.ajax({
      type: 'get',
      url: 'https://getcontents.herokuapp.com/?url=http%3A%2F%2Ftravelplanner.mobiliteit.lu%2Fhafas%2Fcdt%2Fstboard.exe%2Ffn%3FL%3Dvs_stb%26input%3D200404028%26boardType%3Ddep%26time%3D' + moment().format('HH') + '%3A' + moment().format('mm') + '%26selectDate%3Dtoday%26start%3Dyes%26requestType%3D0%26maxJourneys%3D10',
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
    var country = 'LU';
    var appid = '64a2215ad2f5f944abd334578763726e';

    var request = $.ajax({
        type: 'get',
        // fixme: use an api that supports https
        url: 'https://getcontents.herokuapp.com/?url=http://api.openweathermap.org/data/2.5/weather?q=' + city + ',' + country + '&units=metric&appid=' + appid,
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

  temperature = temperature - 273.15; // K to C

  temperature = ( temperature ).toFixed(1); // 1 decimal

  if (temperature > 10 ) {
    temperature = Math.round( temperature ); // round up to the nearest integer
  }
  return temperature + '°C';
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
        url: 'https://spaceapi.syn2cat.lu/status/json',
        complete: function( response ) {

            var status =  JSON.parse( response.responseText );

            var timeStamp = moment.unix( status.state.lastchange ).fromNow();

            $('.status').removeClass('open').removeClass('closed');

            if ( status.state.open ) {
                $('.status')
                    .addClass('open')
                    .html('<h1>Open!</h1> Opened ' + timeStamp);
            } else {
                $('.status')
                    .addClass('closed')
                    .html('<h1>Closed</h1> ' + timeStamp);
            }

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated Level2 status' );

}

function l2events() {

    var request = $.ajax({
        type: 'get',
        url: 'https://wiki.hackerspace.lu/wiki/Special:Ask/-5B-5BCategory:Event-5D-5D-20-5B-5BStartDate::-3E' + moment().format('YYYY') + '-2D' + moment().format('MM') + '-2D' + moment().format('DD') + '-5D-5D/-3FStartDate/-3FEndDate/-3FHas-20subtitle/-3FHas-20description/-3FIs-20Event-20of-20Type%3DIs-20type/-3FHas-20location/-3FHas-20picture/-3FHas-20cost/-3FCategory/format%3Djson/sort%3DStartDate/order%3Dascending/searchlabel%3DJSON-20(Internal,-20only-20upcoming-20events)',
        complete: function( response ) {

            var events =  JSON.parse( response.responseText );

            var output = '';

            for ( var l2eventNR = 0; l2eventNR < 5; l2eventNR++ ) {

                var l2event = events.items[ l2eventNR ];

                var label       = $('<h1>').html( l2event.label ).text();
                var description = $('<p>').html( l2event.has_subtitle ).text();

                output += '<div class="panel">'
                + '<h1>' + label + ' <small>'
                + moment( l2event.startdate, "YYYY-MM-DD HH:mm:ss").format( 'dddd, Do \of MMMM' )
                + '</small></h1>'
                + description
                + '</div>';

            };

            $('.events').html('').append( output );

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated Level2 events' );

}

function wortLuNews() {

    var request = $.ajax({
        type: 'get',
        url: 'https://device.wort.lu/api/v303/sites/en/sections/4f4e59a1e4b056b73debc870',
        complete: function( response ) {

            var articles =  response.responseJSON.articles;

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

function cflNews() {

    var request = $.ajax({
        type: 'get',
        url: 'https://getcontents.herokuapp.com/?url=http%3A%2F%2Fmobile.cfl.lu%2Fbin%2Fhelp.exe%2Fenl%3Ftpl%3Drss_feed_global',
        complete: function( response ) {

            var cfl = response.responseText;

            var output = '';

            $( $.parseXML( cfl ) )
            .find("item")
            .each( function() {

                output += '<div class="panel">'
                + '<h1>' + $(this).find("title").text() + '</h1>'
                + $(this).find("description").text()
                + '</div>';

            });

            $('.cfl').html('').append( output );

        }
    });

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated cfl News' );

}

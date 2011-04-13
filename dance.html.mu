<!DOCTYPE html>
<html>
<head>
<style type="text/css">
  html { height: 100%; background-color: grey; }
  body { height: 780px; margin: 0 auto; padding: 0px; width: 1005px; text-align:center; background-color: white; box-shadow: 0 0 15px #000;}
  div { font-family: Verdana; font-size:11px; text-align:center;}
  a { color: black; font-size: 11px; font-family: Verdana;}
  p { margin: 0px; font-family: Verdana; font-size: 11px; auto-margin: left; auto-margin: right;}
  #title { text-align:center;font-size:35px; width:100%;}
  #description {text-align: center; width: 100%;}
  #share {}
  #dancer { height: 560px;}
  #results{ width: 1000px; }
  #results-container { font-family: Arial; font-size:14px; text-align:center; width: 100%; overflow: hidden; margin-left: 0px; padding-top: 10px; height: 130px;}
  #results .result{ float:left; width:136;}
  #results-left { float:left; font-size: 20px; vertical-align: middle; font-color: '#D3D3D3';}
  #results-right { float:right; font-size: 20px; vertical-align: middle; font-color: '#D3D3D3';}
  #controller { margin-left: 420px; top: 730px; width: 350px;  position: absolute; }
  #controller .direction { float:left; padding: 5px; margin: 3px;  background-color: #66FF55; width: 40px; font-color: white; font-size: 26px; opacity: .5; border-width: 1px; }
  #control {}
</style>
<script src="./lib/jquery.js"></script>
<script src="./lib/jquery-ui-1.8.11.custom.min.js"></script>
<script type="text/javascript">
    $(function() {
        $( "#slider" ).slider();
    });
    </script>
<script type="text/javascript">

  var API_KEY='734a9120e423cbafbfb5044c6d196c42';
  var product_id = 7818770;
  var imageMap = {};
  var dancing = false;
  var rotating = false;
  var types = ['TOP','LEFT','BACK','PAIR'];
  var curr_style_id = 0;
  var searchResults = {};
  var page_id = 1;
  var idx = 0;
  var interval = 350;
  var LIMIT = 7;
  var search_url;
  var spirit_url = 'http://api.zappos.com/Search?filters={"brandNameFacet":["Spirit%20Hoods"]}&key='+API_KEY;
  var TOTAL_RESULT_COUNT = 0;

  function initialize() {
    var flickr_url='http://api.flickr.com/services/feeds/photos_public.gne?tags=cat&tagmode=any&format=json&jsoncallback=?';
    //var search_url='http://api.zappos.com/Search?filters={"zc1":["Clothing"],"zc2":["Tops"],"brandFacet":["Spirit%20Hoods"]}&limit=7&key='+API_KEY;
//    var search_url='http://api.zappos.com/Search?filters={"brandNameFacet":["Spirit%20Hoods"]}&limit=7&key='+API_KEY;
    //var search_url='http://api.zappos.com/Search?filters={"zc1":["Clothing"],"zc2":["Swimwear"],"txAttrFacet_Gender":["Women"]}&limit=7&key='+API_KEY;
    var zappos_url='http://api.zappos.com/Image?productId='+product_id+'&recipe=MULTIVIEW&callback=?&key='+API_KEY;
    var images = '';

    var path_input = '{{input_term}}';
    if(path_input != null && path_input != '') {
       search_url = 'http://api.zappos.com/Search?term='+path_input+'&limit=7&key='+API_KEY;
    }
    else {
        search_url = spirit_url;
    }
    get_search_results();
    
    var twist = ['TOP','LEFT'];
    var turn = ['PAIR','TOP','BOTTOM','LEFT'];

    $('div#twist-right').click(function() {
        types = ['PAIR','RIGHT'];
        idx = 0;
        if(imageMap['RIGHT']==null) {
            types = ['PAIR', 'TOP']
        }
        $('div#twist-right').attr('style','opacity:1;');
        $('div#twist-left').attr('style','opacity:.5;');
        $('div#turn').attr('style','opacity:.5;');
//        $('div#twist-left').unwrap('<b/>');
//        $('div#turn').unwrap('<b/>');
//        $(this).wrap('<b/>');
    });

    $('div#twist-left').click(function() {
        types = ['PAIR','LEFT'];
        idx = 0;
         if(imageMap['LEFT']==null) {
             $('#notice').replaceWith('<div id="notice">Oh no, I am a Zoolander... <br>I cannot turn left!</div>');
        }
        $('div#twist-left').attr('style', 'opacity:1;');    
        $('div#turn').attr('style','opacity:.5;');
        $('div#twist-right').attr('style','opacity:.5;');
    });

    $('div#turn').click(function() {
        types = turn;
        idx = 0;
        interval = 300;
//        $('div#twist-right').unwrap('<b/>');
//        $('div#twist-left').unwrap('<b/>');
//        $('div#turn').wrap('<b/>');
        $('div#turn').attr('style','opacity:1;');
        $('div#twist-left').attr('style','opacity:.5;');
        $('div#twist-right').attr('style','opacity:.5;');
    });


    $('div#toggle').click(function() {
        if(dancing) {
            $(this).replaceWith("I need MORE DANCING!");
            dancing = false;
        }
        else{
            $(this).replaceWith("No more dancing.");
            start_dancing();
        }
    });


   $('#submit-button').click(function() {
        var input = $('#term').val();
        search_url = 'http://api.zappos.com/Search?term='+input+'&limit=7&key='+API_KEY;
        page_id = 1;
        get_search_results();
        return false;
   });

    $('#results-left').click(function() {
        if(show_left_arrow()) {
            page_id -= 1;
            get_search_results();
        }
    });

    $('#results-right').click(function() {
        if(show_right_arrow()) {
            page_id += 1;
            get_search_results();
        }
    });


    $('#slider').slider();

        $('#share').toggle(function() {
            var share_url = 'http://crystal.no.de/dance';
            if(input != null && input !='' ) { 
                share_url += '/'+input; 
            }
            $('#link').replaceWith('<div id="link">'+share_url+'</div>');
        }, 
        function() {
            $('#link').replaceWith('<div id="link"></div>');
        }); 
  }

    function get_search_results() {
        var curr_search_url = search_url+'&page='+page_id;
        // let's clear everything, in case we already loaded up...
        $('#results').empty();
        
      $.ajax({
        url:curr_search_url,
        dataType:'jsonp',
        success:function(data) {
            searchResults = data.results;
            $.each(searchResults, function(i, item) {
               var productName = item.productName;
                var maxLength = 17;
                if(productName.length > maxLength) {
                    productName = productName.substring(0, maxLength)+'...';
                } 
               $('<div>').attr('id', 'd'+i).attr('class', 'result').html('<p><a href="'+item.productUrl+'" target="new"><b>'+item.brandName+'</b><br/>'+productName+'</a></p>').appendTo('#results');
               $('<img/>').attr('src', item.thumbnailImageUrl).attr('id', item.styleId)
                          .attr('href', item.productUrl).click(function() {
                    var img_url = 'http://api.zappos.com/Image?styleId='+item.styleId+'&recipe=MULTIVIEW&callback=?&key='+API_KEY;
                    var styleId = item.styleId;
                    curr_style_id = styleId;
                    get_images(styleId);
               }).prependTo('#d'+i);
               
            });
            
            TOTAL_RESULT_COUNT = data.totalResultCount;
            get_images(searchResults[0].styleId);
            change_arrows();
        }
     });

    }

    function get_images(styleId) {
        var img_url = 'http://api.zappos.com/Image?styleId='+styleId+'&recipe=MULTIVIEW&callback=?&key='+API_KEY;
        $.ajax({
            url:img_url,
            dataType:'jsonp',
            success:function(data) {
                imageMap = {};
                $.each(data[styleId], function(i, item) {
                    imageMap[item.type] = item;
                });
                $('img').attr('border',0);
                $('#'+styleId).attr('border',1);
                if(!dancing) start_dancing();
            }
        });
    }

    function start_dancing() {
        dancing = true;
        var mooove = setInterval( function() {
            
            if(dancing == false) {
                clearInterval(mooove);
            }

            var image = imageMap[types[idx]];
            while(image == null) {
                if(idx==types.length-1) { idx = 0;}
                else{ idx = idx+1; }
                image = imageMap[types[idx]];
            }

            $('img#dancer').attr('src', imageMap[types[idx]].filename);
            if(idx==types.length-1) {
                idx = 0;
            }
            else{
                idx = idx+1;
            }
        }
        , interval);
    }

    function show_left_arrow() {
        if(page_id != 1) {
            return true;
        }
        else {
            return false;
        }
    }

    function show_right_arrow() {
        var so_far = page_id * LIMIT;
        if(so_far < TOTAL_RESULT_COUNT) {
            return true;
        }
        else {
            return false;
        }
    }

    function change_arrows() {
        var color_left = 'black';
        var color_right = 'black';

        if(!show_left_arrow()) {
           color_left = '#D3D3D3';
        }
        if(!show_right_arrow()) {
            color_right = '#D3D3D3';
        }

        $('#results-left').attr('style', 'color:'+color_left);
        $('#results-right').attr('style', 'color:'+color_right);

    }

    $(document).ready(function() {
//        var slider = $('div#slider').slider();
  //      $('div#slider').slider({max: 7, min: 0});
    });
</script>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-22614011-1']);
  _gaq.push(['_setDomainName', 'none']);
  _gaq.push(['_setAllowLinker', true]);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</head>
<body onload="initialize()">
    <div id="title">
        SPIRIT DANCERZ
        <div id="description">Click on your favorite item to give it some spirit!</div>
    </div>
    <div id="search-container">
        <form id="search">
            <font color="grey">...or search for your favorite Zappos products: <input type="text" name="term" id="term"/></font>
            <input type="submit" id="submit-button" value="GO"/>
        </form>
    </div>
    <div id="results-container">
        <div id="results-left">&#8592;</div>
        <div id="results"></div>
        <div id="results-right">&#8594;</div>
    </div>
    <img id="dancer"><!-- src="http://www.zappos.com/images/z/1/5/4/1545838-1-MULTIVIEW.jpg"-->
   <!--div id="notice"></div-->
    <div id="controller">
        <!--div id="toggle">No more dancing!</div-->
        <div id="twist-right" class='direction'><font face="webdings">&#51;</font></div>
        <div id="turn" class='direction'><font face="webdings">&#113;</font></div>
        <div id="twist-left" class='direction'><font face="webdings">&#52;</font></div>
    </div>
    <div id="slider"></div>
    <br><br>
    <a href="http://twitter.com/share" class="twitter-share-button" data-text="Can't. Stop. Dancing! http://www.spiritdancerz.com" data-count="horizontal">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>
    <p>Powered by the <a href="http://developers.zappos.com" target="new">Zappos API</a>.</p>
    <p>Compatible with Google Chrome, and perhaps ONLY Google Chrome. Sowwie, I'm not a hipster front-end developer.</p>
    <p>twitter: <a href="http://www.twitter.com/crystalschang">@crystalschang</a>    
    <br><br>
    <audio src="animal.ogg" loop controls>
</body>
</html>


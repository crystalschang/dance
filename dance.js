
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
  var search_url='http://api.zappos.com/Search?filters={"brandNameFacet":["Spirit%20Hoods"]}&key='+API_KEY;
  var TOTAL_RESULT_COUNT = 0;

  function initialize() {
    var flickr_url='http://api.flickr.com/services/feeds/photos_public.gne?tags=cat&tagmode=any&format=json&jsoncallback=?';
    //var search_url='http://api.zappos.com/Search?filters={"zc1":["Clothing"],"zc2":["Tops"],"brandFacet":["Spirit%20Hoods"]}&limit=7&key='+API_KEY;
//    var search_url='http://api.zappos.com/Search?filters={"brandNameFacet":["Spirit%20Hoods"]}&limit=7&key='+API_KEY;
    //var search_url='http://api.zappos.com/Search?filters={"zc1":["Clothing"],"zc2":["Swimwear"],"txAttrFacet_Gender":["Women"]}&limit=7&key='+API_KEY;
    var zappos_url='http://api.zappos.com/Image?productId='+product_id+'&recipe=MULTIVIEW&callback=?&key='+API_KEY;
    var images = '';

    get_search_results();
    
    var twist = ['TOP','LEFT'];
    var turn = ['PAIR','TOP','BOTTOM','LEFT'];

    $('div#twist-right').click(function() {
        types = ['PAIR','RIGHT'];
        idx = 0;
        if(imageMap['RIGHT']==null) {
            types = ['PAIR', 'TOP']
        }

//        $('div#twist-left').unwrap('<b/>');
//        $('div#turn').unwrap('<b/>');
//        $(this).wrap('<b/>');
    });

    $('div#twist-left').click(function() {
        types = ['PAIR','LEFT'];
        idx = 0;
         if(imageMap['LEFT']==null) {
             $('#notice').replaceWith('<div id="notice">Oh no, I\'m a Zoolander... <br>I can\'t turn left!</div>');
        }
//        $(this).wrap('<b/>');
//        $('div#twist-right').unwrap('<b/>');    
//        $('div#turn').unwrap('<b/>');
    });

    $('div#turn').click(function() {
        types = turn;
        idx = 0;
        interval = 300;
//        $('div#twist-right').unwrap('<b/>');
//        $('div#twist-left').unwrap('<b/>');
//        $('div#turn').wrap('<b/>');
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
        console.log(input);
        search_url = 'http://api.zappos.com/Search?term='+input+'&limit=7&key='+API_KEY;
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
            get_images(searchResults[3].styleId);
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


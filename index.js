function pageFunction(context) {
    // called on every page the crawler visits, use it to extract data from it
    var $ = context.jQuery;
    
    function makeRequest(url, data, type, accept){
           var returnData = '';
                $.get({
                    url : url,
                    type: type,
                    timeout: 3000,
                    dataType : 'text',
                    async: false,
                    headers: {
                        'Host': 'www.google.com',
                        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0',
                        'Accept': accept,
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'deflate',
                        'Referer': window.location.href,
                        'Content-Length': 123,
                        'Content-Type': accept,
                        'origin': 'www.google.com',
                        'Cookie': document.cookie,
                        'Connection': 'keep-alive',
                    }
                }).done(function(msg){
                     returnData = msg;
                }).fail(function(jqXHR, textStatus, errorThrown){
                    console.log(JSON.stringify(jqXHR));
                    console.log('Error loading recommended products: (' + textStatus + ')' + errorThrown);
                }).always(function(){
                    //context.finish();
                });
                return returnData;
            }

    if (context.request.label==='LIST'){
        $('a[data-item-name="detail-page-link"]').each(function(){
            context.enqueuePage({
                url : window.location.origin + $(this).attr('href'),
                label : 'DETAIL'
            });
        });
        context.skipOutput();
    }
    
    if (context.request.label==='DETAIL'){
        var extractData = function(){
            var o = JSON.parse($('as24-ad-targeting').html());
            console.log(JSON.stringify(o))
            console.log('https://maps.googleapis.com/maps/api/distancematrix/json?origins=Liberec&destinations='+o.zip.substr(0,2)+'+'+o.zip.substr(2)+'&key=AIzaSyCspCG4gW0H_iOzQCNkThfkDXlIyJOB_fw')
            var d = makeRequest('https://maps.googleapis.com/maps/api/distancematrix/json?origins=Liberec&destinations='+o.zip.substr(0,2)+'+'+o.zip.substr(2)+'&key=AIzaSyCspCG4gW0H_iOzQCNkThfkDXlIyJOB_fw','{}','GET','*/*');
            console.log(d)
            d = JSON.parse(d);
            var vzdalenost = '';
            var doba = '';
            if (d.rows[0].elements[0].status==="OK"){
                vzdalenost = d.rows[0].elements[0].distance.text
                doba = d.rows[0].elements[0].duration.text
            }
        
           context.finish({
               jmeno : $('div[class="cldt-stage sc-clearfix"] h1[class="sc-ellipsis"]').text().trim(),
               cena : $('div[class="cldt-stage sc-clearfix"] div[class="cldt-stage-data"] div[class="cldt-price"] h2').text().trim(),
               km : $('div[class="cldt-stage sc-clearfix"] div[class="cldt-stage-data"] span[class="sc-font-l cldt-stage-primary-keyfact"]').eq(0).text().trim(),
               datum : $('div[class="cldt-stage sc-clearfix"] div[class="cldt-stage-data"] span[class="sc-font-l cldt-stage-primary-keyfact"]').eq(1).text().trim(),
               motor : $('div[class="cldt-stage sc-clearfix"] div[class="cldt-stage-data"] span[class="sc-font-l cldt-stage-primary-keyfact"]').eq(2).text().trim(),
               obsah : $('dt:contains("Hubraum")').next().text().trim(),
               bezDane : ($('p:contains("MwSt. ausweisbar")').length!==0),
               cenaBezDane : ($('p:contains("MwSt. ausweisbar")').length===0?o.cost:parseInt(o.cost)*0.8),
               prodejce : o.zip,
               vzdalenost : vzdalenost,
               doba : doba,
               id : context.request.url.substr(0,context.request.url.indexOf('?'))
               //allData : o
            });
        };
        context.willFinishLater();
        setTimeout(extractData,2000);
    }
}

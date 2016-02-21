var fs    = require('fs');
var jsdom  = require('jsdom');

var domain = 'https://www.petrescue.com.au'
var nextLink = 'https://www.petrescue.com.au/listings/dogs?per_page=48&utf8=%E2%9C%93&size%5B%5D=all&age=either&gender=either&states%5B%5D=2&postcode_distance=50&postcode=&commit=Search&page=1';

if (!fs.existsSync('cache')) {
  fs.mkdirSync('cache');
}

var out = {
  'dogs': [],
};

scrapeLinkList();

function scrapeLinkList() {
  jsdom.env(
    nextLink,
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var $ = window.$;

      // the dog files
      $('#dogs-listing .listing').each(function(idx, elem) {
        var nameLink = $('.name a', elem);
        var id = nameLink.attr('href').replace('/listings/', '');
        var name = nameLink.text();

        var infoLine = $('.info-line', elem);
        var gender = $('dd.gender', infoLine).text();
        var breed = $('dd.breed', infoLine).text();

        out['dogs'].push({
          id: id,
          name: name,
          gender: gender,
          breed: breed
        });

      });
      nextLink = $('.footer-pagination .next a').attr('href');
      console.log('nextLink is ', nextLink);

      if (nextLink) {
        nextLink = domain + nextLink;
        scrapeLinkList();
      } else {
        // sort
        out['dogs'].sort(function(a, b) {
          return a.id - b.id;
        });

        // now save
        fs.writeFile('data/dogs.json', JSON.stringify(out['dogs'], null, 2), function(err) {
          if (err) {
            console.error("ERR: ", err);
          }
          console.log('Dogs data written');
        });
      }
    });
}

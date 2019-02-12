const rp = require('request-promise');
const cheerio = require('cheerio');

var appRouter = function (app) {
  app.get("/menu/today", function (req, res) {  

    const options = {
      uri: `https://www.cobie.de/speisekarte`,
      transform: function (body) {
        return cheerio.load(body);
      }
    };

    rp(options)
    .then(($) => {
      // assume first slide (0) in Carousel is today
      let todaysMenu = $('.foodCarousel--day').eq(0);
      let todaysDate = todaysMenu.find('.dayheadline').text();
      let menuItems = [];

      todaysMenu.find('li').each(function() {
        let item = $(this);
        menuItems.push({
          title: item.find('.product--title .cobie-product-name').text(),
          // split and map to integer
          allergenIds: item.find('.product--title sup').text().split(", ").map((x) => parseInt(x)),
          // use Regex to get numbers from string, then parse as float
          price: parseFloat(item.find('.woocommerce-Price-amount').text().replace(/[^0-9.-]+/g,"")),
          // convert currency symbol to 3 letter abbreviation 
          currency: (item.find('.woocommerce-Price-currencySymbol').text()) === '€' ? "EUR" : "other",
          description: item.find('.cobie-product-description').text()
        });
      });
      res.status(200).send({ 
        data: {
          todaysDate: todaysDate,
          menuItems: menuItems
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send({ error: err });
    });
  });
}

module.exports = appRouter;
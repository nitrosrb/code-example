(function() {
  'use strict';

  $('.contacts-list__contact').click(function () {
    $('.contacts-list__more-details').hide();
    $(this).children('.contacts-list__more-details').show();
  });
})();

function randInt(min, max, positive) {
  let num;
  if (positive === false) {
    num = Math.floor(Math.random() * max) - min;
    num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  } else {
    num = Math.floor(Math.random() * max) + min;
  }

  return num;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return raw ? parseInt(raw[2], 10) : false;
}

function randomArray(length, max) {
  return Array.apply(null, Array(length)).map(function() {
    return Math.round(Math.random() * max);
  });
}

$.fn.customerPopup = function (e, intWidth, intHeight, blnResize) {
  // Prevent default anchor event
  e.preventDefault();

  // Set values for window
  intWidth = intWidth || '500';
  intHeight = intHeight || '400';
  strResize = (blnResize ? 'yes' : 'no');

  // Set title and open popup with focus on it
  var strTitle = ((typeof this.attr('title') !== 'undefined') ? this.attr('title') : 'Social Share'),
      strParam = 'width=' + intWidth + ',height=' + intHeight + ',resizable=' + strResize,
      objWindow = window.open(this.attr('href'), strTitle, strParam).focus();
}

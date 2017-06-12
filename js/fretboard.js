function Fretboard(canvas, songLoader, rockWidth, pegWidth) {
  var ctx = canvas.getContext("2d"),
      blockHeight = rockWidth,
      block = {
        x: 0,
        y: canvas.height - blockHeight,
        width: canvas.width,
        height: blockHeight
      };

  var highlightedFret;

  function drawCircle(x, y) {
    var circleSize = (blockHeight / 6 - 1) / 2;

    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawLine(x, y, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  return {
    draw: function() {
      ctx.strokeStyle = "#F1FAEE";
      ctx.lineWidth = 1;
      for(var i = 1; i < songLoader.notes.length; i++) {
        var x = i * rockWidth + pegWidth;
        drawLine(x, block.y, x, canvas.height);
      }
      drawLine(0, block.y, canvas.width, block.y);

      // draw single circles
      var circleFrets = [2, 4, 6, 8];
      var cirlceColor = "#F1FAEE";
      var verticalMiddle = canvas.height - blockHeight / 2;
      var circleSize = (blockHeight / 6 - 1) / 2;

      circleFrets.forEach(function(fret) {
        drawCircle((rockWidth * fret - 1) + rockWidth / 2 + pegWidth, verticalMiddle);
      });

      // draw double circles
      var doubleCirclesFret = 12;
      drawCircle((rockWidth * 11) + rockWidth / 2 + pegWidth, canvas.height - circleSize * 2.5);
      drawCircle((rockWidth * 11) + rockWidth / 2 + pegWidth, canvas.height - block.height + 2.5 * circleSize);

      if(typeof(highlightedFret) === "number") {
        ctx.fillStyle = "#F991CC";
        ctx.fillRect(highlightedFret * rockWidth, block.y, rockWidth - pegWidth, rockWidth);
      }
    },
    highlightFret: function(note) {
      var fretIndex = songLoader.findNoteIndex(note);

      highlightedFret = fretIndex;

      setTimeout(function() {
        highlightedFret = undefined;
      }, 100);
    }
  }
}

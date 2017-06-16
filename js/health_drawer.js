function HealthDrawer(ctx) {
  var heartWidth = 40;
  var heartHeight = 25;
  var c1 = 2;
  var c2 = 2;

  function drawBezierCurve(x0, y0, x1, y1, x2, y2, x3, y3) {
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
  }

  return {
    draw: function(health) {
      var prevFillStyle = ctx.fillStyle;
      var prevStrokeStyle = ctx.strojeStyle;

      ctx.fillStyle = gameConfig.colors.red;
      ctx.strokeStyle = gameConfig.colors.red;

      for(var i = 0; i < health; i++) {
        var x = ctx.canvas.width - heartWidth - i * (heartWidth + 10);
        var y = 20;

        ctx.beginPath();
        drawBezierCurve(x, y, x, y - heartHeight / 2, x - heartWidth / 2, y - heartHeight / 2, x - heartWidth / 2, y);
        drawBezierCurve(x - heartWidth / 2, y, x - heartWidth / 2, y + heartHeight / 2, x, y + heartHeight / 2 * c1, x, y + heartHeight / 2 * c2);
        drawBezierCurve(x, y + heartHeight / 2 * c2, x, y + heartHeight / 2 * c1, x + heartWidth / 2, y + heartHeight / 2, x + heartWidth / 2, y);
        drawBezierCurve(x + heartWidth / 2, y, x + heartWidth / 2, y - heartHeight / 2, x, y - heartHeight / 2, x, y);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x - heartWidth / 2, y);
        ctx.lineTo(x + heartWidth / 2, y);
        ctx.lineTo(x, y + heartHeight / 2 * c2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill()
      }

      ctx.fillStyle = prevFillStyle;
      ctx.strokeStyle = prevStrokeStyle;
    }
  }
}

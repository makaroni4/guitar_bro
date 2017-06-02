$(function() {
  var $score = $(".real-guitar-hero__score");
  var NOTES = ["Q", "W", "E", "R", "T", "Y"];
  var NOTE_CODES = {
    81: "Q",
    87: "W",
    69: "E",
    82: "R",
    84: "T",
    89: "Y"
  }

  //canvas variables
  var canvas = document.getElementById("game-canvas");
  var ctx = canvas.getContext("2d");

  // game variables
  var startingScore = 50;
  var continueAnimating = false;
  var score;

  // block variables
  var blockWidth = canvas.width;
  var blockHeight = 50;
  var block = {
      x: 0,
      y: canvas.height - blockHeight,
      width: blockWidth,
      height: blockHeight
  }

  // rock variables
  var rockWidth = 50;
  var rockHeight = 50;
  var totalRocks = 2;
  var rockDistance = canvas.height / totalRocks;
  var rocks = [];
  for (var i = 0; i < totalRocks; i++) {
    addRock(i);
  }

  function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function addRock(rockIndex) {
    var note = pickRandom(NOTES);
    var rock = {
      width: rockWidth,
      height: rockHeight,
      note: note,
      speed: 3
    }
    resetRock(rock, rockIndex);
    rocks.push(rock);
  }

  function resetRock(rock, rockIndex) {
    rock.x = Math.random() * (canvas.width - rockWidth);
    rock.y = -rockIndex * rockDistance
    rock.note = pickRandom(NOTES);
  }

  document.onkeydown = function (event) {
    var rockIndex = rocks.findIndex(function(r) {
      return r.y >= canvas.height - blockHeight - rockHeight;
    });

    if(rockIndex === -1) {
      return;
    }

    var rock = rocks[rockIndex];

    if(!isColliding(block, rock)) {
      return;
    }

    var key = NOTE_CODES[event.keyCode];

    if(key === rock.note) {
      score += 10;
    } else {
      score -= 10;
    }

    var currentY = rock.y;
    resetRock(rock, 0);
    rock.y -= canvas.height - currentY - rockHeight;
  }

  function animate() {
    if (continueAnimating) {
      requestAnimationFrame(animate);
    }

    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];

      rock.y += rock.speed;

      if (rock.y > canvas.height) {
        resetRock(rock, 0);
        rock.y -= rockHeight;
        score -= 10;
      }
    }

    drawAll();
  }

  function isColliding(a, b) {
    return !(
      b.x > a.x + a.width ||
        b.x + b.width < a.x ||
        b.y > a.y + a.height ||
        b.y + b.height < a.y
    );
  }

  function drawAll() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background
    ctx.fillStyle = "ivory";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the block
    ctx.fillStyle = "skyblue";
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = "lightgray";
    ctx.strokeRect(block.x, block.y, block.width, block.height);

    // draw all rocks
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];
      ctx.fillStyle = "#FFA100";
      ctx.fillRect(rock.x, rock.y, rock.width, rock.height);

      ctx.font = "18px Times New Roman";
      ctx.fillStyle = "#FFF";
      ctx.fillText(rock.note, rock.x + 25, rock.y + 25);
    }

    $score.text(score);
  }

  $(".start-game").on("click", function () {
    score = startingScore
    block.x = 0;

    for (var i = 0; i < rocks.length; i++) {
      resetRock(rocks[i], i);
    }

    if(!continueAnimating) {
      continueAnimating = true;
      animate();
    };
  });
});
